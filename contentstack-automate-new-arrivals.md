# Contentstack Automate: Auto-Remove BookInfo from New Arrivals

## Overview
This guide shows how to create a Contentstack Automate workflow that:
1. **Triggers** when a new BookInfo entry is published
2. **Waits** for 24 hours (1 day)
3. **Removes** the entry from /new-arrivals page

## Prerequisites
- Contentstack Automate enabled on your stack
- BookInfo content type configured
- New Arrivals page/reference field setup

## Step-by-Step Setup

### Step 1: Access Contentstack Automate

1. **Login to Contentstack**
   - Go to [app.contentstack.com](https://app.contentstack.com)
   - Select your stack

2. **Navigate to Automate**
   ```
   Left Sidebar → Automate → Automations
   ```

3. **Create New Automation**
   - Click "+ Create Automation"
   - Choose "From Scratch"

### Step 2: Configure the Trigger

```yaml
Trigger Configuration:
  Name: "BookInfo New Arrival Auto-Remove"
  Description: "Automatically remove BookInfo from new-arrivals after 24 hours"
  
  Trigger Type: "Entry Published"
  Content Type: "BookInfo"
  Environment: "production" (or your target environment)
  
  Conditions:
    - Field: "status" (if you have one)
      Operator: "equals"
      Value: "published"
```

**Setup in UI:**
1. **Trigger**: Select "Entry Published"
2. **Content Type**: Choose "BookInfo" 
3. **Environment**: Select your target environment
4. **Advanced Conditions** (if needed):
   - Add condition to only trigger for entries that should go to new-arrivals

### Step 3: Add Wait/Delay Action

```yaml
Action 1 - Wait/Delay:
  Action Type: "Wait"
  Duration: "24 hours" (1440 minutes)
  
  Configuration:
    Time Unit: "Hours"
    Duration: 24
```

**Setup in UI:**
1. Click "+ Add Action"
2. Select "Wait" or "Delay"
3. Set duration to **24 hours**

### Step 4: Add Removal Action

You have several options for removing from new-arrivals:

#### Option A: Update Entry Field (Recommended)

If you have a field like `show_in_new_arrivals` or `new_arrival_expiry`:

```yaml
Action 2 - Update Entry:
  Action Type: "Update Entry"
  Target: "Triggering Entry"
  
  Field Updates:
    show_in_new_arrivals: false
    # OR
    new_arrival_expiry: "{{ current_date }}"
    # OR  
    tags: "remove:new-arrivals"
```

**Setup in UI:**
1. Click "+ Add Action"
2. Select "Update Entry"
3. Choose "Use triggering entry"
4. Configure field updates:
   ```
   Field: show_in_new_arrivals
   Value: false
   ```

#### Option B: Remove from Reference Field

If new-arrivals page has a reference field pointing to BookInfo entries:

```yaml
Action 2 - Update Referenced Entry:
  Action Type: "Update Entry"
  Target: "Specific Entry"
  Entry: "new-arrivals page entry"
  
  Field Updates:
    featured_books: "{{ remove_reference(triggering_entry.uid) }}"
    # OR use webhook to custom logic
```

#### Option C: Webhook Action (Most Flexible)

```yaml
Action 2 - Webhook:
  Action Type: "Webhook"
  URL: "https://your-app.com/api/remove-from-new-arrivals"
  Method: "POST"
  
  Headers:
    Content-Type: "application/json"
    Authorization: "Bearer YOUR_API_KEY"
  
  Body:
    {
      "entry_uid": "{{ triggering_entry.uid }}",
      "content_type": "{{ triggering_entry.content_type }}",
      "action": "remove_from_new_arrivals",
      "timestamp": "{{ current_timestamp }}"
    }
```

### Step 5: Complete Automation Setup

```yaml
Final Configuration:
  Name: "BookInfo New Arrival Auto-Remove"
  Status: "Active"
  
  Flow:
    1. Trigger: Entry Published (BookInfo)
    2. Wait: 24 hours
    3. Action: Remove from new-arrivals
  
  Notifications:
    - Email on success
    - Email on failure
```

## Implementation Examples

### Example 1: Using Boolean Field

**Content Type Setup:**
```json
{
  "content_type": "BookInfo",
  "fields": [
    {
      "uid": "title",
      "data_type": "text"
    },
    {
      "uid": "show_in_new_arrivals",
      "data_type": "boolean",
      "default_value": true
    },
    {
      "uid": "new_arrival_date",
      "data_type": "date"
    }
  ]
}
```

**Automation Action:**
```yaml
Update Entry:
  show_in_new_arrivals: false
  new_arrival_expiry: "{{ current_date }}"
```

### Example 2: Using Tags

**Automation Action:**
```yaml
Update Entry:
  tags: "{{ remove_from_array(tags, 'new-arrivals') }}"
```

### Example 3: Using Custom Webhook

**Webhook Implementation:**
```javascript
// /api/remove-from-new-arrivals
export async function POST(request) {
  const { entry_uid, content_type } = await request.json();
  
  try {
    // Option 1: Update the BookInfo entry
    await contentstack.Entry(content_type, entry_uid).update({
      show_in_new_arrivals: false
    });
    
    // Option 2: Update new-arrivals page
    const newArrivalsPage = await contentstack.Entry('page', 'new-arrivals-uid').fetch();
    const updatedBooks = newArrivalsPage.featured_books.filter(
      book => book.uid !== entry_uid
    );
    
    await newArrivalsPage.update({
      featured_books: updatedBooks
    });
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

## Frontend Implementation

### Query for New Arrivals (with expiry logic)

```javascript
// Get books for new-arrivals page
const getNewArrivals = async () => {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.date - 1);
  
  const query = contentstack.Entry('BookInfo')
    .where('show_in_new_arrivals', true)
    .where('published_at', { $gte: oneDayAgo.toISOString() })
    .orderByDescending('published_at')
    .limit(10);
    
  const result = await query.find();
  return result[0];
};
```

### React Component Example

```jsx
// components/new-arrivals.jsx
import { useEffect, useState } from 'react';

export default function NewArrivals() {
  const [newBooks, setNewBooks] = useState([]);
  
  useEffect(() => {
    const fetchNewArrivals = async () => {
      const books = await getNewArrivals();
      setNewBooks(books);
    };
    
    fetchNewArrivals();
  }, []);
  
  return (
    <div className="new-arrivals">
      <h2>New Arrivals</h2>
      <p>Fresh books from the last 24 hours!</p>
      
      {newBooks.map(book => (
        <div key={book.uid} className="book-card">
          <h3>{book.title}</h3>
          <p>Added: {new Date(book.published_at).toLocaleDateString()}</p>
          <span className="new-badge">NEW!</span>
        </div>
      ))}
    </div>
  );
}
```

## Advanced Configuration

### Multiple Environments

```yaml
Automation per Environment:
  Development:
    Wait Duration: 5 minutes (for testing)
    
  Staging:  
    Wait Duration: 1 hour (for validation)
    
  Production:
    Wait Duration: 24 hours (actual requirement)
```

### Conditional Logic

```yaml
Advanced Conditions:
  - Only for books with specific tags
  - Only for books above certain price
  - Only for specific categories
  
Trigger Conditions:
  Field: book_type
  Operator: in
  Values: ["Fiction", "Non-Fiction", "Mystery"]
```

### Error Handling

```yaml
Error Handling:
  On Failure:
    - Send email notification
    - Log to external system
    - Retry after 1 hour (max 3 attempts)
  
  On Success:
    - Log successful removal
    - Update analytics
```

## Testing the Automation

### Test Scenarios

1. **Create Test BookInfo Entry**
   ```bash
   # Publish a new BookInfo entry
   # Verify it appears in new-arrivals
   # Wait for automation to trigger
   # Verify removal after 24 hours
   ```

2. **Monitor Automation Logs**
   ```
   Contentstack → Automate → Automations → View Logs
   ```

3. **Test with Shorter Duration**
   ```yaml
   Development Test:
     Wait Duration: 2 minutes
     Verify: Entry removed after 2 minutes
   ```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Automation not triggering | Check trigger conditions and content type |
| Wait not working | Verify wait duration format |
| Field update failing | Check field permissions and data types |
| Webhook timeout | Increase timeout or optimize webhook code |

### Debug Steps

1. **Check Automation Logs**
2. **Verify Entry Permissions** 
3. **Test Webhook Independently**
4. **Check Environment Settings**
5. **Validate Field Mappings**

## Best Practices

### Performance
- ✅ Use boolean fields instead of complex queries
- ✅ Batch process multiple entries
- ✅ Set appropriate timeouts
- ✅ Monitor automation performance

### Reliability
- ✅ Add error handling and retries
- ✅ Log all automation activities
- ✅ Test in development first
- ✅ Set up monitoring alerts

### Maintenance
- ✅ Regular review of automation logs
- ✅ Update field mappings as needed
- ✅ Monitor webhook endpoints
- ✅ Keep documentation updated

This setup will automatically manage your new arrivals, ensuring books only appear there for exactly 24 hours after publication! 🚀
