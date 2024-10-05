document.addEventListener("DOMContentLoaded", () => {
    const userName = document.getElementById("name");
    const TName = document.getElementById("Tname");
    const submitBtn = document.getElementById("submitBtn");
    if (!userName || !TName || !submitBtn) {
        console.error("Required elements are not found in the DOM.");
        return; // Exit if elements are missing
    }
    
    const { PDFDocument, rgb } = PDFLib;

    const capitalize = (str, lower = false) =>
        (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, (match) =>
            match.toUpperCase()
        );

    submitBtn.addEventListener("click", async () => {
        const val = capitalize(userName.value);
        const teamName = capitalize(TName.value);

        const isNamePresent = await checkNamePresence(val);

        if (isNamePresent) {
            if (val.trim() !== "" && userName.checkValidity() && TName.checkValidity() && teamName.trim() !== "") {
                generatePDF(val, teamName);
            } else {
                userName.reportValidity(); // Ensures proper error reporting for invalid input
            }
        } else {
            alert("Please enter a valid name.");
        }
    });

    const checkNamePresence = async (name) => {
        try {
            const nameListResponse = await fetch("./name.txt");
            const nameListText = await nameListResponse.text();
            const names = nameListText.split("\n").map((line) => line.trim().toLowerCase());
            return names.includes(name.toLowerCase());
        } catch (error) {
            console.error("Error fetching name list:", error);
            return false;
        }
    };

    const generatePDF = async (name, teamName) => {
        try {
            const existingPdfBytes = await fetch("./cert.pdf").then((res) => res.arrayBuffer());
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            
            // Load the fontkit correctly
            pdfDoc.registerFontkit(fontkit);
            
            const fontBytes = await fetch("./Bold & Stylish Calligraphy.ttf").then((res) => res.arrayBuffer());
            const MTCORSVA = await pdfDoc.embedFont(fontBytes);
            
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];

            const textWidthName = MTCORSVA.widthOfTextAtSize(name, 28);
            const pageWidth = firstPage.getSize().width;
            const centerXName = (pageWidth - textWidthName) / 2;

            firstPage.drawText(name, {
                x: centerXName,
                y: 310,
                size: 35,
                font: MTCORSVA,
                color: rgb(0, 0, 0),
            });

            firstPage.drawText(teamName, {
                x: 190,
                y: 265,
                size: 30,
                font: MTCORSVA,
                color: rgb(0, 0, 0),
            });

            const pdfBytes = await pdfDoc.save();
            console.log("Done creating PDF");

            var file = new File([pdfBytes], "aarambh3.0.pdf", {
                type: "application/pdf;charset=utf-8",
            });
            saveAs(file);
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };
});
