# react-to-pdf-docs
Turn React page into well-formatted pdf document

# Features
- A4 sized, multi pages
- Page number included 
- Well formatted, long text will be wrapped to next page, not cut off
- Built on jspdf and html2canvas

# How to use
Accepted Arguments:
- filename: the name of the downloaded pdf file eg. "testDocument"
- printIds: array of element Ids to be printed eg. ["ele1", "ele2", "ele3"]


import {printDocument} from "react-to-pdf-docs"

```
<div>
    <div id="ele1">
        <span>random text</span>
    </div>
    <div id="ele2">
        <span>random text</span>
    </div>
    <Button onClick = {
        ()=>{ printDocument(filename="testDocument", printIds=["ele1","ele2"]) }
    }>
</div>
```