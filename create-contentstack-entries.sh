#!/bin/bash

# Contentstack Entry Creation using cURL
# This script demonstrates how to create entries using simple HTTP requests

# Configuration
API_KEY="blte1f8c41539d5f7e3"
MANAGEMENT_TOKEN="${CONTENTSTACK_MANAGEMENT_TOKEN}"
BASE_URL="https://api.contentstack.io/v3"

# Check if management token is provided
if [ -z "$MANAGEMENT_TOKEN" ]; then
    echo "❌ CONTENTSTACK_MANAGEMENT_TOKEN environment variable is required!"
    echo ""
    echo "🔧 To get your Management Token:"
    echo "1. Go to https://app.contentstack.com/"
    echo "2. Navigate to Settings → Tokens"
    echo "3. Create a new Management Token with appropriate permissions"
    echo "4. Export it: export CONTENTSTACK_MANAGEMENT_TOKEN=your_token_here"
    echo ""
    exit 1
fi

# Function to create a BookInfo entry
create_bookinfo_entry() {
    local title="$1"
    local author="$2"
    local genre="$3"
    local price="$4"
    local pages="$5"
    local description="$6"
    
    echo "📚 Creating BookInfo entry: '$title'"
    
    curl -X POST "${BASE_URL}/content_types/bookinfo/entries" \
        -H "Content-Type: application/json" \
        -H "api_key: ${API_KEY}" \
        -H "authorization: ${MANAGEMENT_TOKEN}" \
        -d "{
            \"entry\": {
                \"title\": \"$title\",
                \"author\": \"$author\",
                \"book_type\": \"$genre\",
                \"price\": $price,
                \"number_of_pages\": $pages,
                \"book_description\": \"$description\",
                \"tags\": [\"api-created\", \"$(echo $genre | tr '[:upper:]' '[:lower:]')\"]
            }
        }" | jq '.'
}

# Function to create a NewBookInfo entry
create_newbookinfo_entry() {
    local title="$1"
    local author="$2"
    local genre="$3"
    local price="$4"
    local pages="$5"
    local description="$6"
    
    echo "🆕 Creating NewBookInfo entry: '$title'"
    
    curl -X POST "${BASE_URL}/content_types/newbookinfo/entries" \
        -H "Content-Type: application/json" \
        -H "api_key: ${API_KEY}" \
        -H "authorization: ${MANAGEMENT_TOKEN}" \
        -d "{
            \"entry\": {
                \"title\": \"$title\",
                \"author\": \"$author\",
                \"book_type\": \"$genre\",
                \"price\": $price,
                \"number_of_pages\": $pages,
                \"book_description\": \"$description\",
                \"tags\": [\"api-created\", \"new-arrival\", \"$(echo $genre | tr '[:upper:]' '[:lower:]')\"]
            }
        }" | jq '.'
}

# Function to publish an entry
publish_entry() {
    local content_type="$1"
    local entry_uid="$2"
    local environment="${3:-development}"
    
    echo "📤 Publishing $content_type entry: $entry_uid"
    
    curl -X POST "${BASE_URL}/content_types/${content_type}/entries/${entry_uid}/publish" \
        -H "Content-Type: application/json" \
        -H "api_key: ${API_KEY}" \
        -H "authorization: ${MANAGEMENT_TOKEN}" \
        -d "{
            \"entry\": {
                \"environments\": [\"$environment\"],
                \"locales\": [\"en-us\"]
            }
        }" | jq '.'
}

# Function to list entries
list_entries() {
    local content_type="${1:-bookinfo}"
    
    echo "📋 Listing $content_type entries..."
    
    curl -X GET "${BASE_URL}/content_types/${content_type}/entries" \
        -H "Content-Type: application/json" \
        -H "api_key: ${API_KEY}" \
        -H "authorization: ${MANAGEMENT_TOKEN}" | jq '.entries[] | {uid: .uid, title: .title, author: .author}'
}

# Function to create a test book
create_test_book() {
    echo "🚀 Creating a test book entry..."
    
    local response=$(create_bookinfo_entry \
        "API Test Book" \
        "Automated Author" \
        "Technology" \
        499 \
        200 \
        "This book was created programmatically using the Contentstack Management API to demonstrate automated content creation capabilities.")
    
    # Extract UID from response (assuming jq is available)
    local entry_uid=$(echo "$response" | jq -r '.entry.uid' 2>/dev/null)
    
    if [ "$entry_uid" != "null" ] && [ -n "$entry_uid" ]; then
        echo "✅ Entry created with UID: $entry_uid"
        echo "📤 Publishing entry..."
        publish_entry "bookinfo" "$entry_uid"
        echo "✅ Entry published successfully!"
    else
        echo "❌ Failed to create entry. Response:"
        echo "$response"
    fi
}

# Command line interface
case "$1" in
    "create-test")
        create_test_book
        ;;
    "list")
        list_entries "${2:-bookinfo}"
        ;;
    "create-bookinfo")
        if [ $# -lt 6 ]; then
            echo "Usage: $0 create-bookinfo <title> <author> <genre> <price> <pages> <description>"
            exit 1
        fi
        create_bookinfo_entry "$2" "$3" "$4" "$5" "$6" "$7"
        ;;
    "create-newbookinfo")
        if [ $# -lt 6 ]; then
            echo "Usage: $0 create-newbookinfo <title> <author> <genre> <price> <pages> <description>"
            exit 1
        fi
        create_newbookinfo_entry "$2" "$3" "$4" "$5" "$6" "$7"
        ;;
    "publish")
        if [ $# -lt 3 ]; then
            echo "Usage: $0 publish <content_type> <entry_uid> [environment]"
            exit 1
        fi
        publish_entry "$2" "$3" "${4:-development}"
        ;;
    "help"|*)
        echo "📚 Contentstack Entry Creation Script (cURL version)"
        echo ""
        echo "Usage: $0 <command> [arguments]"
        echo ""
        echo "Commands:"
        echo "  create-test                                    - Create and publish a test book"
        echo "  list [content_type]                           - List entries (default: bookinfo)"
        echo "  create-bookinfo <title> <author> <genre> <price> <pages> <description>"
        echo "  create-newbookinfo <title> <author> <genre> <price> <pages> <description>"
        echo "  publish <content_type> <entry_uid> [environment]"
        echo "  help                                          - Show this help"
        echo ""
        echo "Environment Variables Required:"
        echo "  CONTENTSTACK_MANAGEMENT_TOKEN - Your management token"
        echo ""
        echo "Example:"
        echo "  export CONTENTSTACK_MANAGEMENT_TOKEN=your_token_here"
        echo "  $0 create-test"
        echo ""
        ;;
esac
