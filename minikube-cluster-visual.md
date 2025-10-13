# Minikube Cluster Architecture - Visual Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    MINIKUBE CLUSTER (192.168.64.2)                                                 │
│                                         Single Node                                                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      EXTERNAL ACCESS                                                               │
│                                                                                                                     │
│    🌐 External Users  ──────────────────────────────────────────────────────────────────────────────────────►    │
│                                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                      │
                                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    INGRESS LAYER                                                                   │
│                                                                                                                     │
│  ┌─────────────────────┐    ┌──────────────────┐    ┌──────────────────┐    ┌─────────────────────┐              │
│  │   NGINX Ingress     │    │   lio Ingress    │    │ ltoolsapi Ingress│    │ lookingglass Ingress│              │
│  │   Controller        │◄───┤   Host: *        │    │   Host: *        │    │     Host: *         │              │
│  │   (Running ✅)      │    │   (Active ✅)    │    │   (Active ✅)    │    │    (Active ✅)      │              │
│  │   Port: 80/443      │    │   Port: 80       │    │   Port: 80       │    │    Port: 80         │              │
│  └─────────────────────┘    └──────────────────┘    └──────────────────┘    └─────────────────────┘              │
│                                      │                       │                         │                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                       │                       │                         │
                                       ▼                       ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 APPLICATION SERVICES LAYER                                                         │
│                                                                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │   LIO API       │  │   LTools API    │  │  Looking Glass  │  │   App Service   │  │   LTools v2     │        │
│  │  (FAILING ❌)   │  │  (Running ✅)   │  │  (Running ✅)   │  │  (Running ✅)   │  │  (FAILING ❌)   │        │
│  │  0/1 Replicas   │  │  1/1 Replicas   │  │  1/1 Replicas   │  │  1/1 Replicas   │  │  0/1 Replicas   │        │
│  │  Port: 5353     │  │  Port: 8080     │  │  Port: 4200     │  │  Port: 80       │  │  Port: 8080     │        │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘        │
│           │                     │                     │                     │                     │               │
│           │ ┌─────────────────┐ │ ┌─────────────────┐ │ ┌─────────────────┐ │ ┌─────────────────┐ │               │
│           │ │  Recommender    │ │ │  Subscription   │ │ │  Node Writer    │ │ │   Traffic       │ │               │
│           │ │  (Running ✅)   │ │ │  (Running ✅)   │ │ │  (FAILING ❌)   │ │ │  (FAILING ❌)   │ │               │
│           │ │  1/1 StatefulSet│ │ │  1/1 StatefulSet│ │ │  0/1 StatefulSet│ │ │  0/1 StatefulSet│ │               │
│           │ │  Port: 4200     │ │ │  Port: 4200     │ │ │  Port: 4200     │ │ │  Port: 4200     │ │               │
│           │ └─────────────────┘ │ └─────────────────┘ │ └─────────────────┘ │ └─────────────────┘ │               │
│           │                     │                     │                     │                     │               │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
            │                     │                     │                     │                     │
            ▼                     ▼                     ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                BACKGROUND SERVICES LAYER                                                           │
│                                                                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │   Job Runner    │  │ Metafora Runner │  │ Bulk Collector  │  │ Edge Event      │  │   GCP Auth      │        │
│  │  (FAILING ❌)   │  │  (FAILING ❌)   │  │  (FAILING ❌)   │  │  Handler        │  │  (Running ✅)   │        │
│  │  0/1 Replicas   │  │  0/1 Replicas   │  │  0/1 Replicas   │  │  (Running ✅)   │  │  1/1 Replicas   │        │
│  │  Port: 8080     │  │  HPA Enabled    │  │  Not Ready      │  │  1/1 Replicas   │  │  Port: 443      │        │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘        │
│           │                     │                     │                     │                     │               │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
            │                     │                     │                     │                     │
            ▼                     ▼                     ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 MESSAGING & STREAMING LAYER                                                        │
│                                                                                                                     │
│          ┌─────────────────────────────────────┐              ┌─────────────────────────────────────┐            │
│          │         JetStream/NATS              │              │           PubSub Service            │            │
│          │        (Running ✅)                 │◄────────────►│          (Running ✅)               │            │
│          │        1/1 Replicas                 │              │          1/1 Replicas               │            │
│          │        Port: 4222                   │              │          Port: 8500                 │            │
│          │                                     │              │                                     │            │
│          │  • Event Streaming                  │              │  • Message Queuing                  │            │
│          │  • Job Communication               │              │  • Service Communication           │            │
│          │  • Real-time Data                   │              │  • Async Processing                 │            │
│          └─────────────────────────────────────┘              └─────────────────────────────────────┘            │
│                              │                                                  │                                  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                               │                                                  │
                               ▼                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DATA STORAGE LAYER                                                              │
│                                                                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │     Redis       │  │ Elasticsearch   │  │ Bigtable Emul.  │  │ Spanner Emul.   │  │   App ETCD      │        │
│  │  (Running ✅)   │  │  (Running ✅)   │  │  (Running ✅)   │  │  (Running ✅)   │  │  (Running ✅)   │        │
│  │  1/1 Replicas   │  │  1/1 Replicas   │  │  1/1 Replicas   │  │  1/1 Replicas   │  │  1/1 Replicas   │        │
│  │  Port: 6379     │  │  Port: 9200     │  │  Port: 8600     │  │  Port: 9010/20  │  │  Port: 2379     │        │
│  │                 │  │                 │  │                 │  │                 │  │                 │        │
│  │ • Caching       │  │ • Search Index  │  │ • NoSQL Data    │  │ • Relational    │  │ • Config Store  │        │
│  │ • Session Store │  │ • Logs Storage  │  │ • Analytics     │  │ • ACID Trans.   │  │ • Coordination  │        │
│  │ • Message Queue │  │ • Full-text     │  │ • Time Series   │  │ • Global Scale  │  │ • Service Disc. │        │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘        │
│           ▲                     ▲                     ▲                     ▲                     ▲               │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
            │                     │                     │                     │                     │
            │                     │                     │                     │                     │
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 SCHEDULED JOBS LAYER                                                               │
│                                                                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │  Clean Gens     │  │ Cloud GC        │  │ Defer Monitor   │  │ Dest Metrics    │  │ E2E Latency     │        │
│  │  (ERROR ❌)     │  │  (ERROR ❌)     │  │  (ERROR ❌)     │  │  (ERROR ❌)     │  │  (SUCCESS ✅)   │        │
│  │  */2 hours      │  │  Daily 2AM      │  │  Hourly         │  │  Hourly         │  │  :46 every hr   │        │
│  │  Last: 5h ago   │  │  Last: 9h ago   │  │  Last: 5h ago   │  │  Last: 5h ago   │  │  Last: 22m ago  │        │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘        │
│           │                     │                     │                     │                     │               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │   ES Cull       │  │   Event GC      │  │   GDPR Log      │  │  Quota Rollup   │  │ Work Coordinator│        │
│  │  (ERROR ❌)     │  │  (ERROR ❌)     │  │  (ERROR ❌)     │  │  (ERROR ❌)     │  │  (ERROR ❌)     │        │
│  │  Daily 5AM      │  │  Daily 3:05PM   │  │  :27 every hr   │  │  Hourly         │  │  Every 15 min   │        │
│  │  Last: 6h ago   │  │  Last: 20h ago  │  │  Last: 5h ago   │  │  Last: 5h ago   │  │  Last: 5h ago   │        │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘        │
│           │                     │                     │                     │                     │               │
│  ┌─────────────────┐                                                                                              │
│  │  Work Monitor   │                                                                                              │
│  │  (ERROR ❌)     │                                                                                              │
│  │  :10 every hr   │                                                                                              │
│  │  Last: 5h ago   │                                                                                              │
│  └─────────────────┘                                                                                              │
│           │                                                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                AUTO-SCALING LAYER (HPA)                                                            │
│                                                                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │   LIO API HPA   │  │ Metafora HPA    │  │ NodeWriter HPA  │  │ Subscription HPA│  │  Traffic HPA    │        │
│  │   CPU: 80%      │  │ CPU/MEM: 90%    │  │ CPU/MEM:80/90%  │  │ CPU/MEM: 75%    │  │ CPU/MEM:80/90%  │        │
│  │   Min/Max: 1-1  │  │ Min/Max: 1-1    │  │ Min/Max: 1-1    │  │ Min/Max: 1-1    │  │ Min/Max: 1-1    │        │
│  │   Current: 1    │  │ Current: 1      │  │ Current: 1      │  │ Current: 1      │  │ Current: 1      │        │
│  │  (UNKNOWN ⚠️)   │  │ (UNKNOWN ⚠️)    │  │ (UNKNOWN ⚠️)    │  │ (UNKNOWN ⚠️)    │  │ (UNKNOWN ⚠️)    │        │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘        │
│                                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                KUBERNETES CONTROL PLANE                                                            │
│                                                                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │  kube-apiserver │  │      etcd       │  │  kube-scheduler │  │ controller-mgr  │  │   kube-proxy    │        │
│  │  (Running ✅)   │  │  (Running ✅)   │  │  (Running ✅)   │  │  (Running ✅)   │  │  (Running ✅)   │        │
│  │  Master Node    │  │  Master Node    │  │  Master Node    │  │  Master Node    │  │  DaemonSet      │        │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘        │
│           │                     │                     │                     │                     │               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                                                   │
│  │    CoreDNS      │  │ metrics-server  │  │storage-provision│                                                   │
│  │  (Running ✅)   │  │  (Running ✅)   │  │  (Running ✅)   │                                                   │
│  │  DNS Service    │  │  Resource API   │  │  Volume Mgmt    │                                                   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                                                   │
│                                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      SERVICE MESH / NETWORK                                                        │
│                                                                                                                     │
│    NodePort Services (External Access):                                                                            │
│    ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│    │ • app:80→31098          • bigtable:8600→31985       • elasticsearch:9200→32048                          │  │
│    │ • redis:6379→32491      • spanner:9010→30646        • jetstream:4222→31060                              │  │
│    │ • lioapi:5353→30297     • ltoolsapi:8080→30502      • lookingglass:4200→31379                           │  │
│    │ • recommender:4200→31637 • nodewriter:4200→31590    • traffic:4200→32004                                │  │
│    │ • subscription:4200→32504 • pubsub:8500→32172       • ingress:80→31723,443→30756                       │  │
│    └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                     │
│    ClusterIP Services (Internal):                                                                                  │
│    ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│    │ • kubernetes:443        • kube-dns:53              • metrics-server:443                                  │  │
│    │ • gcp-auth:443          • ingress-controller-admission:443                                               │  │
│    └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

==================================================================================================================
                                           DEPENDENCY FLOW
==================================================================================================================

    External Users
         │
         ▼
    Ingress Layer (nginx-controller → ingresses)
         │
         ▼
    Application Services ────────────────┐
         │                               │
         ▼                               ▼
    Background Services          Messaging Layer (JetStream + PubSub)
         │                               │
         ▼                               ▼
    Data Storage Layer ◄─────────────────┘
         ▲
         │
    Scheduled Jobs (CronJobs)
         │
         ▼
    Auto-scaling (HPA) monitors Application Services
         │
         ▼
    Kubernetes Control Plane manages everything

==================================================================================================================
                                            HEALTH STATUS
==================================================================================================================

🟢 HEALTHY SERVICES (9):
   • App, LTools API, Looking Glass, Recommender, Subscription
   • Redis, Elasticsearch, Bigtable, Spanner, ETCD
   • JetStream, PubSub, gcp-auth, nginx-controller

🔴 FAILING SERVICES (6):
   • LIO API, LTools v2, Node Writer, Traffic, Job Runner, Metafora Runner

🟡 PARTIALLY WORKING (11 CronJobs):
   • Only E2E Latency job completing successfully
   • All other scheduled jobs showing errors

⚠️  MONITORING ISSUES (5 HPAs):
   • All Horizontal Pod Autoscalers showing <unknown> metrics
```

## Key Observations:

### 🏗️ **Architecture Pattern:**
- **Microservices Architecture** with clear separation of concerns
- **Event-driven** communication via JetStream/PubSub
- **Multi-database** approach (Redis, Elasticsearch, Bigtable, Spanner)
- **Scheduled maintenance** via CronJobs
- **Auto-scaling** configured but not working properly

### 🔥 **Critical Issues:**
1. **6 core services** in CrashLoopBackOff state
2. **10+ scheduled jobs** failing consistently  
3. **HPA metrics** not collecting properly
4. **Resource constraints** likely causing failures

### 🌊 **Traffic Flow:**
```
External → NodePort → Ingress → App Services → Background Services → Data Stores
                                      ↓
                                Messaging Layer ← Scheduled Jobs
```

This visual representation shows your complete minikube cluster with all dependencies, health status, and architectural patterns clearly laid out!
