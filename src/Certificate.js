import React, { useState } from "react";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  TextareaAutosize,
  Grid,
  CircularProgress,
  Typography,
  DialogActions,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@material-ui/core";

import { PDFDocument, rgb } from "pdf-lib";
import * as fontkit from "fontkit";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  process.env.PUBLIC_URL + "/pdf.worker.js";

const Descricao =
  "A Direção do Colégio Estadual Cívico-Militar Gregório Szeremeta \n" +
  " confere ao estudante o presente certificado de Menção Honrosa, \n" +
  "  em reconhecimento às boas práticas, atitudes exemplares e \n" +
  "   dedicação demonstradas ao longo do trimestre.";

function Certificate() {
  const [names, setNames] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [additionalText, setAdditionalText] = useState(Descricao);
  const [additionalTextFont, setAdditionalTextFont] = useState("DejaVuSans");
  const [fontSize, setFontSize] = useState("48");
  const [font, setFont] = useState("DejaVuSans");
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [previewName, setPreviewName] = useState("");
  const [template, setTemplate] = useState("TemplateLucas");

  let savedPDFBytes = null;

  const handleOpenModal = () => {
    if (!names.trim()) {
      alert("Por favor, preencha o campo 'Nomes' antes de visualizar.");
      return;
    }
    const firstStudent = names.split(",")[0].trim();
    setPreviewName(firstStudent);
    setOpenModal(true);
  };

  const getFontBytesAndEmbed = async (fontName, pdfDoc) => {
    let fontPath;
    switch (fontName) {
      case "DejaVuSans": fontPath = "DejaVuSans.ttf"; break;
      case "ScriptMTBold": fontPath = "script-mt-bold.ttf"; break;
      case "TomNR": fontPath = "tomnr.ttf"; break;
      case "AlefRegular": fontPath = "Alef-Regular.ttf"; break;
      case "BodoniFLF": fontPath = "BodoniFLF.ttf"; break;
      case "Almarai-Regular": fontPath = "Almarai-Regular.ttf"; break;
      case "Corinthia-Regular": fontPath = "Corinthia-Regular.ttf"; break;
      case "Sacramento-Regular": fontPath = "Sacramento-Regular.ttf"; break;
      case "Astral Sisters": fontPath = "AstralSisters.ttf"; break;
      case "Hello Almeida": fontPath = "Hello Almeida.ttf"; break;
      case "marguerite": fontPath = "marguerite.ttf"; break;
      case "Hickory Jack": fontPath = "Hickory Jack.ttf"; break;
      case "Hickory Jack Light": fontPath = "Hickory JackLight.ttf"; break;
      case "LeagueScriptNumberOne": fontPath = "LeagueScriptNumberOne.ttf"; break;
      case "Maria_lucia": fontPath = "Maria_lucia.ttf"; break;
      case "Little Days Alt": fontPath = "LittleDaysAlt.ttf"; break;
      case "Little Daisy": fontPath = "LittleDaisy.ttf"; break;
      case "Little days": fontPath = "Littledays.ttf"; break;
      default: fontPath = "DejaVuSans.ttf";
    }

    try {
      const fontBytes = await fetch(fontPath).then((res) => {
        if (!res.ok) throw new Error(`Erro ao buscar a fonte: ${fontPath}`);
        return res.arrayBuffer();
      });
      return await pdfDoc.embedFont(fontBytes);
    } catch (error) {
      console.error("Erro ao incorporar a fonte:", error);
      throw error;
    }
  };

  const generatePDFForStudent = async (studentName) => {
    let templateURL;
    switch (template) {
      case "TemplateLucas": templateURL = "template.pdf"; break;
      case "TemplateSeed": templateURL = "template2.pdf"; break;
      case "TemplateLucasDourado": templateURL = "template3.pdf"; break;
      case "TemplateLucas2": templateURL = "template4.pdf"; break;
      case "TemplateRafael": templateURL = "template6.pdf"; break;
      case "TemplateLucas4": templateURL = "template7.pdf"; break;
      default: templateURL = "template.pdf"; break;
    }

    const formatDateToBrazilian = (dateStr) => {
      const [year, month, day] = dateStr.split("-");
      return `${day}/${month}/${year}`;
    };
    const formattedDate = formatDateToBrazilian(date);

    const pdfBytes = await fetch(templateURL).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(pdfBytes);
    pdfDoc.registerFontkit(fontkit);

    const embeddedFont = await getFontBytesAndEmbed(font, pdfDoc);
    const additionalTextEmbeddedFont = await getFontBytesAndEmbed(additionalTextFont, pdfDoc);

    const page = pdfDoc.getPages()[0];

    const adjustFontSizeForName = (name, fontObj, initialSize) => {
      let adjustedSize = initialSize;
      const maxWidth = 400;
      let textWidth = fontObj.widthOfTextAtSize(name, adjustedSize);
      while (textWidth > maxWidth && adjustedSize > 10) {
        adjustedSize -= 1;
        textWidth = fontObj.widthOfTextAtSize(name, adjustedSize);
      }
      return adjustedSize;
    };

    const fontSizeForName = adjustFontSizeForName(studentName, embeddedFont, parseInt(fontSize));

    page.drawText(studentName, {
      x: 99,
      y: 180,
      font: embeddedFont,
      size: fontSizeForName,
      color: rgb(0, 0, 0),
    });

    page.drawText(formattedDate, {
      x: 99,
      y: 82,
      size: 21,
      color: rgb(0, 0, 0),
    });

    page.drawText(additionalText, {
      x: 99,
      y: 340,
      size: 16,
      font: additionalTextEmbeddedFont,
      color: rgb(0, 0, 0),
    });

    return await pdfDoc.save();
  };

  const handleSubmit = async (name) => {
    if (!names.trim()) {
      alert("Por favor, preencha o campo 'Nomes'.");
      return;
    }
    setIsLoading(true);
    if (name) {
      savedPDFBytes = await generatePDFForStudent(name);
      renderPDFPreview(savedPDFBytes);
    }
    setIsLoading(false);
  };

  const downloadPDF = async () => {
    setIsDownloading(true);
    // Divide pela vírgula e limpa apenas espaços das pontas, mantendo espaços entre nomes[cite: 1]
    const students = names.split(",").map(n => n.trim()).filter(n => n !== "");
    
    for (let student of students) {
      // Capitalização automática apenas para o conteúdo do PDF[cite: 1]
      const capitalizedName = student
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");

      const pdfData = await generatePDFForStudent(capitalizedName);
      const blob = new Blob([pdfData], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Nome do arquivo PDF limpo (sem espaços)[cite: 1]
      const fileNameClean = capitalizedName.replace(/\s+/g, "");

      const link = document.createElement("a");
      link.href = url;
      link.download = `certificado_${fileNameClean}.pdf`;
      document.body.appendChild(link);
      link.click();

      await new Promise((resolve) => setTimeout(resolve, 800));
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    setIsDownloading(false);
  };

  const renderPDFPreview = async (pdfBytes) => {
    if (isRendering) return;
    setIsRendering(true);
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const pdf = await pdfjsLib.getDocument(URL.createObjectURL(blob)).promise;
    const page = await pdf.getPage(1);
    const scale = 1.3;
    const viewport = page.getViewport({ scale });
    const canvas = document.getElementById("pdf-preview");
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    const renderContext = { canvasContext: context, viewport: viewport };
    await page.render(renderContext).promise;
    setIsRendering(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <Typography variant="h5" style={{ marginBottom: "20px" }}>Gerador de Certificados CCM</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            label="Nomes (Ex: Lucas Mercer Leniar, Pedro Albuquerque)"
            fullWidth
            variant="outlined"
            value={names}
            // Permite digitar livremente sem travar espaços[cite: 1]
            onChange={(e) => setNames(e.target.value)} 
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField label="Data" type="date" fullWidth variant="outlined" value={date} onChange={(e) => setDate(e.target.value)} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField label="Tamanho da Fonte" fullWidth variant="outlined" value={fontSize} onChange={(e) => setFontSize(e.target.value)} />
        </Grid>

        <Grid item xs={12}>
          <TextareaAutosize
            minRows={4}
            placeholder="Texto do certificado..."
            style={{ width: "100%", padding: "12px", borderRadius: "4px", borderColor: "#ccc", fontFamily: "Roboto, sans-serif" }}
            value={additionalText}
            onChange={(e) => setAdditionalText(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">Fonte do Nome</Typography>
          <Select fullWidth variant="outlined" value={font} onChange={(e) => setFont(e.target.value)}>
            <MenuItem value="DejaVuSans">DejaVuSans</MenuItem>
            <MenuItem value="ScriptMTBold">ScriptMTBold</MenuItem>
            <MenuItem value="Sacramento-Regular">Sacramento-Regular</MenuItem>
          </Select>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">Template</Typography>
          <Select fullWidth variant="outlined" value={template} onChange={(e) => setTemplate(e.target.value)}>
            <MenuItem value="TemplateLucas">Padrão Lucas</MenuItem>
            <MenuItem value="TemplateLucas2">Padrão Lucas 2</MenuItem>
            <MenuItem value="TemplateLucasDourado">Dourado Lucas 3</MenuItem>
            <MenuItem value="TemplateSeed">Padrão Seed</MenuItem>
          </Select>
        </Grid>

        <Grid item xs={12}>
          <Button onClick={downloadPDF} variant="contained" color="secondary" style={{ marginRight: "10px" }} disabled={isDownloading || isRendering}>
            {isDownloading ? <CircularProgress size={24} color="inherit" /> : "Baixar Tudo"}
          </Button>
          
          <Button onClick={handleOpenModal} variant="contained" color="primary" disabled={isRendering}>
            Visualizar Primeiro
          </Button>
        </Grid>
      </Grid>

      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Visualizar Certificado</DialogTitle>
        <DialogContent>
          <Select value={previewName} onChange={(e) => setPreviewName(e.target.value)} fullWidth>
            {names.split(",").map((name, index) => (
              <MenuItem key={index} value={name.trim()}>{name.trim()}</MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Fechar</Button>
          <Button onClick={() => { setOpenModal(false); handleSubmit(previewName); }} color="primary">Ver</Button>
        </DialogActions>
      </Dialog>

      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <canvas id="pdf-preview" style={{ maxWidth: "100%", border: "1px solid #ddd", borderRadius: "8px" }}></canvas>
      </div>
    </div>
  );
}

export { Certificate };
