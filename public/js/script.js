
function makePDF(){


    var title = document.getElementById("title").value;
    var dateVal  = document.getElementById("date").value;
    var description = document.getElementById("description").value;

    //check to make sure user defined stuff
    if (!title || !dateVal || !description){
        alert("please put in a value for all fields");
        return;
    }

    // Default export is a4 paper, portrait, using millimeters for units
    const pdf = new jspdf.jsPDF();

    //add the values of the text box to the pdf
    //http://raw.githack.com/MrRio/jsPDF/master/docs/jsPDF.html#text
    pdf.text(title, 10, 10);
    pdf.text(dateVal, 10, 30);
    pdf.text(description, 10, 50);

    //not too sure how your backend works, but if you can find a way
    //to pass this to the backend, you can have that email it out.
    //otherwise we might have to get creative.


     //http://raw.githack.com/MrRio/jsPDF/master/docs/jsPDF.html#output
     //pdf.output('dataurlnewwindow');//outputs the event file into pdf and opens it in a new window

     //save the pdf data into a variable that contains base64
     var pdfData = pdf.output('datauristring');
	 //var pdfData = btoa(pdf.buildDocument());

	 //only grab the base64 data, it has extra cruft we don't need.
     console.log(pdfData);

	 $.post("/request",
	 {
		 filename: "thePdf.pdf",
		 theContent: pdfData
	 },
	 function (data, status) {
		 console.log(data);
	 });


    //the below code here creates an XML blob of the submission
    //idk how you're doing xml stuff so you might not need this.
    var doc = document.implementation.createDocument("", "", null);
    var catalogElem = doc.createElement("CATALOG")
    var eventElem = doc.createElement("EVENT");
    var titleElem = doc.createElement("TITLE");
    var dateElem = doc.createElement("DATE");
    var descriptionElem = doc.createElement("DESCRIPTION");
    
    titleElem.innerHTML = title;
    dateElem.innerHTML = dateVal;
    descriptionElem.innerHTML = description;

    eventElem.appendChild(titleElem);
    eventElem.appendChild(dateElem);
    eventElem.appendChild(descriptionElem);
    
    catalogElem.appendChild(eventElem);
    doc.appendChild(catalogElem);

    //turn the above xml object into a string
    var serializer = new XMLSerializer();
    var xmlString = serializer.serializeToString(doc);

    //output it as readable xml to the console. 
    console.log(XML.prettify(xmlString))



}



//shamelessly stolen from https://gist.github.com/max-pub/a5c15b7831bbfaba7ad13acefc3d0781
XML = {
    parse: (string, type = 'text/xml') => new DOMParser().parseFromString(string, type),  // like JSON.parse
    stringify: DOM => new XMLSerializer().serializeToString(DOM),                         // like JSON.stringify

    transform: (xml, xsl) => {
        let proc = new XSLTProcessor();
        proc.importStylesheet(typeof xsl == 'string' ? XML.parse(xsl) : xsl);
        let output = proc.transformToFragment(typeof xml == 'string' ? XML.parse(xml) : xml, document);
        return typeof xml == 'string' ? XML.stringify(output) : output; // if source was string then stringify response, else return object
    },

    minify: node => XML.toString(node, false),
    prettify: node => XML.toString(node, true),
    toString: (node, pretty, level = 0, singleton = false) => { // einzelkind
        if (typeof node == 'string') node = XML.parse(node);
        let tabs = pretty ? Array(level + 1).fill('').join('\t') : '';
        let newLine = pretty ? '\n' : '';
        if (node.nodeType == 3) return (singleton ? '' : tabs) + node.textContent.trim() + (singleton ? '' : newLine)
        if (!node.tagName) return XML.toString(node.firstChild, pretty);
        let output = tabs + `<${node.tagName}`; // >\n
        for (let i = 0; i < node.attributes.length; i++)
            output += ` ${node.attributes[i].name}="${node.attributes[i].value}"`;
        if (node.childNodes.length == 0) return output + ' />' + newLine;
        else output += '>';
        let onlyOneTextChild = ((node.childNodes.length == 1) && (node.childNodes[0].nodeType == 3));
        if (!onlyOneTextChild) output += newLine;
        for (let i = 0; i < node.childNodes.length; i++)
            output += XML.toString(node.childNodes[i], pretty, level + 1, onlyOneTextChild);
        return output + (onlyOneTextChild ? '' : tabs) + `</${node.tagName}>` + newLine;
    }
}
