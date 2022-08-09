import {jsPDF} from 'jspdf';
import html2canvas from 'html2canvas';

//constants
const windowWidth = 1080;
const image = {type:'jpeg', quality: 0.98};
const margin = [0.5,0.5];

const createElement = function createElement(tagName, opt){
    var el = document.createElement(tagName);
    if(opt.className) el.className = opt.className;
    if(opt.innerHTML) {
        el.innerHTML = opt.innerHTML;
        var scripts = el.getElementsByTagName('script');
        for (var i = scripts.length; i-- > 0; null) {
            scripts[i].parentNode.removeChild(scripts[i]);
        }
    }
    for (var key in opt.style) {
        el.style[key] = opt.style[key];
    }
    return el;
}

export function recurAdd(printIds, curInd, pdf, filename, prevWidth) {
    if(curInd==printIds.length){
        //assign page number
        const pageCount = pdf.internal.getNumberOfPages();
        for( var i = 1; i<=pageCount; i++){
            pdf.setPage(i);
            pdf.setFontSize(9);
            pdf.text('Page '+ String(i) + ' of '+ String(pageCount), 7.8, 11.4, null, null, "right");
        }

        //save file 
        pdf.save(filename);

        //reset the width
        for(var i = 0;i<printIds.length; i++){
            var curId = printIds[i];
            var ele = document.querySelector("#" + curId);
            ele.style.width = prevWidth;
            window.dispatchEvent(new Event('resize'));
        }

        return;
    }

    var ele = document.querySelector("#" + printIds[curInd]);
    let parentTop = ele.getBoundingClientRect().top;
    var els = ele.querySelectorAll('*');

    //if start and end page are different, create blank space to force this ele to next page
    Array.prototype.forEach.call(els, function pagebreak_loop(el){
        var pxPageHeight = 1080 * 11.7/ 8.3;
        var clientRect = el.getBoundingClientRect();
        var top = clientRect.top - parentTop;
        var bottom = clientRect.bottom - parentTop;

        var startPage = Math.floor(top/ pxPageHeight);
        var endPage = Math.floor(bottom / pxPageHeight);
        var nPages = Math.abs(bottom-top)/ pxPageHeight;

        if(endPage !== startPage && nPages<=1){
            var pad = createElement('div',{
                style:{
                    display:'block',
                    height: pxPageHeight - (top%pxPageHeight) + 'px'
                }
            });
            el.parentNode.insertBefore(pad, el);
        }
    })

    html2canvas(ele, {windowWidth: windowWidth, width: windowWidth, height: ele.scrollHeight, allowTaint: true}).then(canvas=>{
        pdf.addPage();
        var imgWidth = 8.3;
        var pageHeight = 11.7;
        var innerPageWidth = imgWidth - margin[1]*2;
        var innerPageHeight = pageHeight - margin[0] *2;

        //calc number of pages
        var pxFullHeight = canvas.height;
        var pxPageHeight = Math.floor(canvas.width * (pageHeight/ imgWidth));
        var nPages = Math.ceil(pxFullHeight/pxPageHeight);

        var pageHeight = innerPageHeight;

        //create canvas to split up image
        var pageCanvas = document.createElement('canvas');
        var pageCtx = pageCanvas.getContext('2d');
        pageCanvas.width = canvas.width;
        pageCanvas.height = pxPageHeight;

        for(var page = 0; page<nPages; page++){
            //last page
            if(page==nPages-1 && pxFullHeight%pxPageHeight!==0){
                pageCanvas.height = pxFullHeight % pxPageHeight;
                pageHeight = (pageCanvas.height * innerPageWidth) / pageCanvas.width;
            }

            //display page
            var w = pageCanvas.width;
            var h = pageCanvas.height;
            pageCtx.fillStyle = "white";
            pageCtx.fillRect(0,0,w,h);
            pageCtx.drawImage(canvas, 0, page*pxPageHeight, w,h,0,0,w,h);

            //add page to pdf
            if(page>0) pdf.addPage();
            var imgData = pageCanvas.toDataURL('image/' + image.type, image.quality);
            pdf.addImage(imgData, image.type, margin[1] - 0.02, margin[0], innerPageWidth, pageHeight, undefined, 'FAST');
        }
        recurAdd(printIds, curInd+1, pdf, filename, prevWidth);
    })


}
/*
    - filename is the name of the downloaded pdf file eg. "testDocument"
    - printIds is array of element Ids to be printed eg. ["ele1", "ele2", "ele3"]
*/
const printDocument = (filename, printIds) =>{
    //initialise new pdf
    var pdf = new jsPDF('p', 'in', [8.3,11.7]);

    //set the prevWidth
    let prevWidth = document.querySelector("#"+printIds[0]).style.width;

    //convert everything to 1080px
    for(var i = 0;i<printIds.length; i++){
        var curId = printIds[i];
        var ele = document.querySelector("#" + curId);
        ele.style.width = "1080px";
        window.dispatchEvent(new Event('resize'));
    }
    let pdfExport = ()=>{
        recurAdd(printIds, 0, pdf, filename, prevWidth);
    }
    setTimeout(pdfExport, 2000);

}

