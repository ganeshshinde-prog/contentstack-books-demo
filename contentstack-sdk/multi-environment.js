import * as contentstack from 'contentstack';
import * as Utils from '@contentstack/utils';
import ContentstackLivePreview from '@contentstack/live-preview-utils';

// Create multiple Stack instances for different environments
const createStack = (environment) => {
  const stack = contentstack.Stack({
    api_key: process.env.CONTENTSTACK_API_KEY
      ? process.env.CONTENTSTACK_API_KEY
      : process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY,
    delivery_token: process.env.CONTENTSTACK_DELIVERY_TOKEN,
    environment: environment,
    region: process.env.CONTENTSTACK_REGION ? process.env.CONTENTSTACK_REGION : 'us',
    live_preview: {
      enable: true,
      host: process.env.CONTENTSTACK_PREVIEW_HOST,
      preview_token: process.env.CONTENTSTACK_PREVIEW_TOKEN
    },
  });

  if (process.env.CONTENTSTACK_API_HOST) {
    stack.setHost(process.env.CONTENTSTACK_API_HOST);
  }

  return stack;
};

// Create stacks for different environments
const DevelopmentStack = createStack('development');
const NewBookStack = createStack('new_book');

// Initialize Live Preview for both environments
ContentstackLivePreview.init({
  stackSdk: DevelopmentStack, // Use development as primary for live preview
  stackDetails: {
    apiKey: process.env.CONTENTSTACK_API_KEY,
    environment: 'development', // Default to development for live preview
    branch: process.env.CONTENTSTACK_BRANCH,
  },
  clientUrlParams: {
    host: process.env.CONTENTSTACK_APP_HOST,
  },
  enable: true,
  ssr: false,
});

export const { onEntryChange } = ContentstackLivePreview;

const renderOption = {
  span: (node, next) => next(node.children),
};

// Generic function to get entries from a specific stack
const getEntryFromStack = (stack, { contentTypeUid, referenceFieldPath, jsonRtePath }) => {
  return new Promise((resolve, reject) => {
    console.log(`🔍 Starting query for ${contentTypeUid} from environment:`, stack.config?.environment || 'unknown');
    
    const query = stack.ContentType(contentTypeUid).Query();
    if (referenceFieldPath) query.includeReference(referenceFieldPath);
    query
      .includeOwner()
      .toJSON()
      .find()
      .then(
        (result) => {
          console.log(`📦 Raw Contentstack response for ${contentTypeUid}:`, {
            environment: stack.config?.environment || 'unknown',
            resultLength: result?.length || 0,
            firstResult: result?.[0]?.length || 0,
            totalEntries: result?.[0]?.length || 0
          });
          
          if (result?.[0]?.length > 0) {
            console.log(`📚 Sample entries:`, result[0].slice(0, 2).map(entry => ({
              uid: entry.uid,
              title: entry.title,
              environment: stack.config?.environment
            })));
          } else {
            console.warn(`⚠️ No entries found in ${stack.config?.environment || 'unknown'} environment for ${contentTypeUid}`);
          }
          
          jsonRtePath
            && Utils.jsonToHTML({
              entry: result,
              paths: jsonRtePath,
              renderOption,
            });
          resolve(result);
        },
        (error) => {
          console.error(`❌ Contentstack query error for ${contentTypeUid}:`, {
            environment: stack.config?.environment || 'unknown',
            error: error.message,
            stack: error.stack
          });
          reject(error);
        },
      );
  });
};

// Generic function to get entry by URL from a specific stack
const getEntryByUrlFromStack = (stack, {
  contentTypeUid, entryUrl, referenceFieldPath, jsonRtePath,
}) => {
  return new Promise((resolve, reject) => {
    const query = stack.ContentType(contentTypeUid).Query();
    if (referenceFieldPath) query.includeReference(referenceFieldPath);
    query.includeOwner().toJSON();
    const data = query.where('url', `${entryUrl}`).find();
    data.then(
      (result) => {
        jsonRtePath
        && Utils.jsonToHTML({
          entry: result,
          paths: jsonRtePath,
          renderOption,
        });
        resolve(result[0]);
      },
      (error) => {
        console.error(error);
        reject(error);
      },
    );
  });
};

export default {
  // Original methods using development environment
  getEntry({ contentTypeUid, referenceFieldPath, jsonRtePath }) {
    return getEntryFromStack(DevelopmentStack, { contentTypeUid, referenceFieldPath, jsonRtePath });
  },

  getEntryByUrl({ contentTypeUid, entryUrl, referenceFieldPath, jsonRtePath }) {
    return getEntryByUrlFromStack(DevelopmentStack, { contentTypeUid, entryUrl, referenceFieldPath, jsonRtePath });
  },

  // New methods for specific environments
  getDevelopmentEntry({ contentTypeUid, referenceFieldPath, jsonRtePath }) {
    console.log(`🔧 Fetching from DEVELOPMENT environment: ${contentTypeUid}`);
    return getEntryFromStack(DevelopmentStack, { contentTypeUid, referenceFieldPath, jsonRtePath });
  },

  getNewBookEntry({ contentTypeUid, referenceFieldPath, jsonRtePath }) {
    console.log(`🆕 Fetching from NEW_BOOK environment: ${contentTypeUid}`);
    console.log(`🔧 Environment details:`, {
      environment: 'new_book',
      contentType: contentTypeUid,
      apiKey: process.env.CONTENTSTACK_API_KEY ? 'Set' : 'Missing',
      deliveryToken: process.env.CONTENTSTACK_DELIVERY_TOKEN ? 'Set' : 'Missing'
    });
    console.log(`🔍 NewBookStack config:`, {
      environment: NewBookStack.config?.environment,
      api_key: NewBookStack.config?.api_key ? 'Set' : 'Missing',
      delivery_token: NewBookStack.config?.delivery_token ? 'Set' : 'Missing'
    });
    return getEntryFromStack(NewBookStack, { contentTypeUid, referenceFieldPath, jsonRtePath });
  },

  getDevelopmentEntryByUrl({ contentTypeUid, entryUrl, referenceFieldPath, jsonRtePath }) {
    console.log(`🔧 Fetching by URL from DEVELOPMENT environment: ${contentTypeUid} - ${entryUrl}`);
    return getEntryByUrlFromStack(DevelopmentStack, { contentTypeUid, entryUrl, referenceFieldPath, jsonRtePath });
  },

  getNewBookEntryByUrl({ contentTypeUid, entryUrl, referenceFieldPath, jsonRtePath }) {
    console.log(`🆕 Fetching by URL from NEW_BOOK environment: ${contentTypeUid} - ${entryUrl}`);
    return getEntryByUrlFromStack(NewBookStack, { contentTypeUid, entryUrl, referenceFieldPath, jsonRtePath });
  },

  // Environment-specific stacks for direct access
  DevelopmentStack,
  NewBookStack,
};
