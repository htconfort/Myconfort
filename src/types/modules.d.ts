// src/types/modules.d.ts
// Déclarations TypeScript pour les modules sans types officiels

declare module 'html2pdf.js' {
    interface Html2PdfOptions {
      margin?: number | number[];
      filename?: string;
      html2canvas?: {
        scale?: number;
        useCORS?: boolean;
        letterRendering?: boolean;
        allowTaint?: boolean;
        backgroundColor?: string;
        logging?: boolean;
        width?: number;
        height?: number;
        scrollX?: number;
        scrollY?: number;
      };
      jsPDF?: {
        unit?: string;
        format?: string;
        orientation?: string;
        compress?: boolean;
      };
    }
  
    interface Html2Pdf {
      set(options: Html2PdfOptions): Html2Pdf;
      from(element: HTMLElement): Html2Pdf;
      save(): Promise<void>;
      output(type?: string): Promise<any>;
      outputPdf(): Promise<any>;
    }
  
    function html2pdf(): Html2Pdf;
    export default html2pdf;
  }
  
  declare module 'emailjs-com' {
    interface EmailJSResponseStatus {
      status: number;
      text: string;
    }
  
    interface TemplateParams {
      [key: string]: any;
    }
  
    export function init(userID: string): void;
    export function send(
      serviceID: string,
      templateID: string,
      templateParams?: TemplateParams,
      userID?: string
    ): Promise<EmailJSResponseStatus>;
    
    export function sendForm(
      serviceID: string,
      templateID: string,
      form: HTMLFormElement | string,
      userID?: string
    ): Promise<EmailJSResponseStatus>;
  
    const emailjs: {
      init: typeof init;
      send: typeof send;
      sendForm: typeof sendForm;
    };
  
    export default emailjs;
  }/// <reference types="html2pdf.js" />