
#! WikiPeida testing code
from wikiextract import WikipediaExtractor
from dotenv import load_dotenv
import os
wiki=WikipediaExtractor()

Summary,content,categories=None,None,None
title = "World War 2"

pg=wiki.search(title, results_limit=5)
# print(pg)

page_info = wiki.get_page_info(title)

if "error" in page_info:
    print(f"Error: {page_info['error']} - {page_info['message']}")
else:
    # print(f"Title: {page_info.get('title', 'N/A')}")
    # print("-"*50)
    # print(f"URL: {page_info.get('url', 'N/A')}")
    # print("-"*50)
    
    Summary=page_info.get('summary', 'N/A')
    # print(f"Summary: {Summary}")
    # print("-"*50)

    content = page_info.get('content', '')[:5000]  # Limit to first 5000 chars
    # print(f"Content: {content[:5000]}..." if content else "Content not available.")
    # print("-"*50)
    
    categories=page_info.get('categories', [])[:5]
    # print(f"Categories: {}")
    # print("-"*50)

    # print(f"Links: {page_info.get('links', [])[:5]}")
    # print("-"*50)

    # print(f"Images: {page_info.get('images', [])[:5]}")
    # print("-"*50)

    # print(f"Timestamp: {page_info.get('timestamp', 'N/A')}")
    # print("-"*50)

    # references = page_info.get('references', [])
    # print(f"References: {references[:5]}" if references else "No references found.")

