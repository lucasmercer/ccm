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
  "confere ao estudante o certificado de Menção Honrosa por ter alcançado \n" +
  "o primeiro lugar do ano turma na Prova Paraná - 1ª edição de 2023.";

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

  const [template, setTemplate] = useState("TemplateLucas"); // Definindo "Padrão Lucas" como padrão

  let savedPDFBytes = null;

  const handleOpenModal = () => {
    if (!names.trim()) {
      // Verifica se o campo está vazio
      alert(
        "Por favor, preencha o campo 'Nomes' antes de visualizar os certificados."
      );
      return; // Não continue se o campo de nomes estiver vazio
    }

    const firstStudent = names.split(",")[0].trim();
    setPreviewName(firstStudent);
    setOpenModal(true);
  };

  const getFontBytesAndEmbed = async (fontName, pdfDoc) => {
    let fontPath;
    switch (fontName) {
      case "DejaVuSans":
        fontPath = "DejaVuSans.ttf";
        break;
      case "ScriptMTBold":
        fontPath = "script-mt-bold.ttf";
        break;
      case "TomNR":
        fontPath = "tomnr.ttf";
        break;
      case "AlefRegular":
        fontPath = "Alef-Regular.ttf";
        break;
      case "BodoniFLF":
        fontPath = "BodoniFLF.ttf";
        break;
      case "Almarai-Regular":
        fontPath = "Almarai-Regular.ttf";
        break;
      case "Corinthia-Regular":
        fontPath = "Corinthia-Regular.ttf";
        break;
      case "Sacramento-Regular":
        fontPath = "Sacramento-Regular.ttf";
        break;
      case "Astral Sisters":
        fontPath = "AstralSisters.ttf";
        break;
      case "Hello Almeida":
        fontPath = "Hello Almeida.ttf";
        break;
      case "marguerite":
        fontPath = "marguerite.ttf";
        break;
      case "Hickory Jack":
        fontPath = "Hickory Jack.ttf";
        break;
      case "Hickory Jack Light":
        fontPath = "Hickory JackLight.ttf";
        break;
      case "LeagueScriptNumberOne":
        fontPath = "LeagueScriptNumberOne.ttf";
        break;
      case "Maria_lucia":
        fontPath = "Maria_lucia.ttf";
        break;
      case "Little Days Alt":
        fontPath = "LittleDaysAlt.ttf";
        break;
      case "Little Daisy":
        fontPath = "LittleDaisy.ttf";
        break;
      case "Little days":
        fontPath = "Littledays.ttf";
        break;
      default:
        fontPath = "DejaVuSans.ttf"; // Fonte padrão
    }

    try {
      const fontBytes = await fetch(fontPath).then((res) => {
        if (!res.ok) throw new Error(`Erro ao buscar a fonte: ${fontPath}`);
        return res.arrayBuffer();
      });
      return await pdfDoc.embedFont(fontBytes);
    } catch (error) {
      console.error("Erro ao incorporar a fonte:", error);
      throw error; // Repropaga o erro
    }
  };

  // Função para capitalizar a primeira letra de cada nome
  const capitalizeFirstLetter = (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const generatePDFForStudent = async (studentName) => {
    let templateURL;
    switch (template) {
      case "TemplateLucas":
        templateURL = "template.pdf";
        break;
      case "TemplateSeed":
        templateURL = "template2.pdf";
        break;
      case "TemplateLucasDourado":
        templateURL = "template3.pdf";
        break;
      case "TemplateLucas2":
        templateURL = "template4.pdf";
        break;
      case "TemplateRafael":
        templateURL = "template6.pdf";
        break;
      case "TemplateLucas4":
        templateURL = "template7.pdf";
        break;
      //  adicionar mais cases quando tiver outros templates
      default:
        templateURL = "template.pdf";
        break;
    }

    const formatDateToBrazilian = (date) => {
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    };
    const formattedDate = formatDateToBrazilian(date);

    const pdfBytes = await fetch(templateURL).then((res) => res.arrayBuffer());

    const pdfDoc = await PDFDocument.load(pdfBytes);
    pdfDoc.registerFontkit(fontkit);

    // função para o nome do aluno
    const embeddedFont = await getFontBytesAndEmbed(font, pdfDoc);

    // função para o texto adicional
    const additionalTextEmbeddedFont = await getFontBytesAndEmbed(
      additionalTextFont,
      pdfDoc
    );

    const page = pdfDoc.getPages()[0];

    const adjustFontSizeForName = (studentName, font, initialSize) => {
      let adjustedSize = initialSize;
      const maxWidth = 400; // Ajuste conforme necessário
      let textWidth = font.widthOfTextAtSize(studentName, adjustedSize);

      while (textWidth > maxWidth && adjustedSize > 10) {
        // 10 é o tamanho mínimo da fonte
        adjustedSize -= 1; // Reduz o tamanho da fonte em 1
        textWidth = font.widthOfTextAtSize(studentName, adjustedSize);
      }

      return adjustedSize;
    };

    const fontSizeForName = adjustFontSizeForName(
      studentName,
      embeddedFont,
      parseInt(fontSize)
    );

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
      // Verifica se o campo está vazio
      alert(
        "Por favor, preencha o campo 'Nomes' antes de visualizar os certificados."
      );
      return; // Não continue se o campo de nomes estiver vazio
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
    const students = names.split(",");
    for (let student of students) {
      savedPDFBytes = await generatePDFForStudent(student);

      const blob = new Blob([savedPDFBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `certificado_${student}.pdf`;

      document.body.appendChild(link);
      link.click();

      // Espera um pouco entre cada download para evitar problemas
      await new Promise((resolve) => setTimeout(resolve, 1000));

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

    const scale = 1.5;
    const viewport = page.getViewport({ scale });

    const canvas = document.getElementById("pdf-preview");
    const context = canvas.getContext("2d");

    // Limpe o canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
    setIsRendering(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Grid item xs={12}>
        <TextField
          label="Nomes (separados por vírgula e sem espaço entre eles)"
          fullWidth
          value={names}
          onChange={(e) => {
            const sanitizedNames = e.target.value.replace(/,\s+/g, ",");
            // Aplica a capitalização à primeira letra de cada nome
            const capitalizedNames = sanitizedNames
              .split(",")
              .map((name) => capitalizeFirstLetter(name.trim()))
              .join(", ");
            setNames(capitalizedNames);
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Data"
          type="date"
          fullWidth
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <TextareaAutosize
          minRows={6}
          placeholder={Descricao}
          style={{ width: "100%" }}
          value={additionalText}
          onChange={(e) => setAdditionalText(e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle1" style={{ marginBottom: "8px" }}>
          Escolha a Fonte do Texto Adicional
        </Typography>
        <Select
          value={additionalTextFont}
          onChange={(e) => setAdditionalTextFont(e.target.value)}
        >
          <MenuItem value="DejaVuSans">DejaVuSans</MenuItem>
          <MenuItem value="ScriptMTBold">ScriptMTBold</MenuItem>
          <MenuItem value="AlefRegular">AlefRegular</MenuItem>
          <MenuItem value="TomNR">TomNR</MenuItem>
          <MenuItem value="BodoniFLF">BodoniFLF</MenuItem>
          <MenuItem value="Almarai-Regular">Almarai-Regular</MenuItem>
          <MenuItem value="Corinthia-Regular">Corinthia-Regular</MenuItem>
          <MenuItem value="Sacramento-Regular">Sacramento-Regular</MenuItem>
          <MenuItem value="Astral Sisters">Astral Sisters</MenuItem>
          <MenuItem value="Hello Almeida">Hello Almeida</MenuItem>
          <MenuItem value="marguerite">marguerite</MenuItem>
          <MenuItem value="Hickory Jack">Hickory Jack</MenuItem>
          <MenuItem value="Hickory Jack Light">Hickory Jack Light</MenuItem>
          <MenuItem value="Maria_lucia">Maria_lucia</MenuItem>
          <MenuItem value="Little Days Alt">Little Days Alt</MenuItem>
          <MenuItem value="Little Daisy">Little Daisy</MenuItem>
          <MenuItem value="Little days">Little days</MenuItem>
        </Select>
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Tamanho da Fonte"
          fullWidth
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle1" style={{ marginBottom: "8px" }}>
          Escolha a Fonte utilizada no nome do estudante
        </Typography>
        <Select value={font} onChange={(e) => setFont(e.target.value)}>
          <MenuItem value="DejaVuSans">DejaVuSans</MenuItem>
          <MenuItem value="ScriptMTBold">ScriptMTBold</MenuItem>
          <MenuItem value="AlefRegular">AlefRegular</MenuItem>
          <MenuItem value="TomNR">TomNR</MenuItem>
          <MenuItem value="BodoniFLF">BodoniFLF</MenuItem>
          <MenuItem value="Almarai-Regular">Almarai-Regular</MenuItem>
          <MenuItem value="Corinthia-Regular">Corinthia-Regular</MenuItem>
          <MenuItem value="Sacramento-Regular">Sacramento-Regular</MenuItem>
          <MenuItem value="Astral Sisters">Astral Sisters</MenuItem>
          <MenuItem value="Hello Almeida">Hello Almeida</MenuItem>
          <MenuItem value="marguerite">marguerite</MenuItem>
          <MenuItem value="Hickory Jack">Hickory Jack</MenuItem>
          <MenuItem value="Hickory Jack Light">Hickory Jack Light</MenuItem>
          <MenuItem value="Maria_lucia">Maria_lucia</MenuItem>
          <MenuItem value="Little Days Alt">Little Days Alt</MenuItem>
          <MenuItem value="Little Daisy">Little Daisy</MenuItem>
          <MenuItem value="Little days">Little days</MenuItem>
        </Select>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" style={{ marginBottom: "10px" }}>
          Escolha o Template
        </Typography>
        <Select value={template} onChange={(e) => setTemplate(e.target.value)}>
          <MenuItem value="TemplateLucas">Padrão Lucas</MenuItem>
          <MenuItem value="TemplateLucas2">Padrão Lucas 2</MenuItem>
          <MenuItem value="TemplateLucasDourado">Dourado Lucas 3</MenuItem>
          <MenuItem value="TemplateLucas4">Padrão Lucas 4</MenuItem>
          <MenuItem value="TemplateSeed">Padrão Seed</MenuItem>
          <MenuItem value="TemplateRafael">Padrão Rafael</MenuItem>
          {/* Você pode adicionar mais templates aqui no futuro */}
        </Select>
      </Grid>

      <Grid container item spacing={2} xs={12}>
        <Grid item>
          <Button
            onClick={() => downloadPDF(savedPDFBytes)}
            variant="contained"
            color="secondary"
            disabled={isDownloading || isRendering}
          >
            {isDownloading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Baixar Certificado(s)"
            )}
          </Button>
        </Grid>
        <Grid item>
          <Button
            onClick={handleOpenModal}
            variant="contained"
            color="primary"
            disabled={isLoading || isRendering}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Visualizar Certificados"
            )}
          </Button>
          <Dialog
            open={openModal}
            onClose={() => setOpenModal(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Escolha um nome para visualizar"}
            </DialogTitle>
            <DialogContent>
              <Select
                value={previewName}
                onChange={(e) => setPreviewName(e.target.value)}
                fullWidth
              >
                {names.split(",").map((name, index) => (
                  <MenuItem key={index} value={name.trim()}>
                    {name.trim()}
                  </MenuItem>
                ))}
              </Select>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenModal(false)} color="primary">
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setOpenModal(false);
                  handleSubmit(previewName);
                }}
                color="primary"
                autoFocus
              >
                Visualizar
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <canvas id="pdf-preview"></canvas>
      </Grid>
    </div>
  );
}

export { Certificate };
