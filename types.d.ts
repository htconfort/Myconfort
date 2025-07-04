// types.d.ts - Déclarations TypeScript pour modules sans types

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
    export = html2pdf;
  }
  
  declare module 'emailjs-com' {
    interface EmailJSResponse {
      status: number;
      text: string;
    }
  
    interface TemplateParams {
      [key: string]: any;
    }
  
    export function init(publicKey: string): void;
    
    export function send(
      serviceId: string,
      templateId: string,
      templateParams: TemplateParams,
      publicKey?: string
    ): Promise<EmailJSResponse>;
  
    export function sendForm(
      serviceId: string,
      templateId: string,
      form: HTMLFormElement,
      publicKey?: string
    ): Promise<EmailJSResponse>;
  
    const emailjs: {
      init: typeof init;
      send: typeof send;
      sendForm: typeof sendForm;
    };
  
    export default emailjs;
  }