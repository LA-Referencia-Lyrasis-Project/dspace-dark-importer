export type Language = "en" | "pt";

export interface TranslationDictionary {
  app: {
    title: string;
    subtitle: string;
    languageLabel: string;
    english: string;
    portuguese: string;
    toggleTheme: string;
  };
  footer: {
    ariaLabel: string;
    howItWorks: string;
    tutorial: string;
    privacyPolicy: string;
    github: string;
    feedback: string;
    rightsReserved: string;
  };
  pages: {
      howItWorks: {
        title: string;
        description: string;
        prerequisiteTitle: string;
        prerequisiteBody: string;
        compatibilityTitle: string;
        compatibilityBody: string;
        stepsTitle: string;
        steps: Array<{
          title: string;
          body: string;
          details?: string[];
        }>;
      csvExampleTitle: string;
      csvExampleDescription: string;
      reportTitle: string;
      reportBody: string;
    };
    privacy: {
      title: string;
      description: string;
      sections: Array<{
        title: string;
        body: string;
      }>;
    };
      tutorial: {
        title: string;
        description: string;
        prerequisiteTitle: string;
        prerequisiteBody: string;
        workflow: string[];
        videoLabel: string;
        openOnYoutube: string;
      };
  };
  steps: {
    configuration: string;
    validation: string;
    processing: string;
    results: string;
    ariaLabel: string;
  };
  common: {
    back: string;
    cancel: string;
    continue: string;
    errors: string;
    field: string;
    invalid: string;
    message: string;
    multiple: string;
    notFound: string;
    remaining: string;
    row: string;
    rows: string;
    severity: string;
    skipped: string;
    start: string;
    status: string;
    time: string;
    total: string;
    totalRows: string;
    updated: string;
    readyForExport: string;
    valid: string;
    warnings: string;
    closeModal: string;
  };
  configuration: {
    title: string;
    description: string;
    restApiUrl: string;
    handleBaseUrl: string;
    csvUploadTitle: string;
    csvUploadDescription: string;
    chooseCsvFile: string;
    csvOnly: string;
    parsingCsv: string;
    noFileSelected: string;
    unableToParseCsv: string;
    uploadBeforeContinuing: string;
  };
  validation: {
    title: string;
    uploadBeforeValidation: string;
    validationPassed: string;
    resolveValidationErrors: string;
    noValidationIssues: string;
    backToConfiguration: string;
    startImport: string;
    modalTitle: string;
    modalDescription: string;
    modalWarningTitle: string;
    modalWarningText: (count: string, rowWord: string, metadataField: string) => string;
    startProcessing: string;
    issueSeverity: Record<"error" | "warning", string>;
  };
  processing: {
    title: string;
    uploadAndValidateBeforeProcessing: string;
    progressDescription: (processed: string, total: string) => string;
    waitingToStart: string;
    viewResults: string;
    logRow: string;
    statuses: Record<"idle" | "authenticating" | "processing" | "completed" | "cancelled", string>;
    stats: {
      total: string;
      processed: string;
      updated: string;
      skipped: string;
      readyForExport: string;
      notFound: string;
      multiple: string;
      errors: string;
      remaining: string;
    };
  };
  results: {
    title: string;
    description: string;
    noReport: string;
    newImport: string;
    downloadReport: string;
    downloadItemsDarks: string;
    columns: {
      oaiIdentifier: string;
      generatedUri: string;
      darkId: string;
      itemUuid: string;
      status: string;
      message: string;
    };
  };
  csv: {
    uploadCsvFile: string;
    csvCouldNotBeParsed: string;
    uploadBeforeContinuing: string;
    missingRequiredColumn: (column: string) => string;
    oaiIdentifierRequired: string;
    malformedOaiIdentifier: string;
    darkIdRequired: string;
    duplicateOaiIdentifier: (identifier: string, rows: string) => string;
    duplicateDarkId: (darkId: string, rows: string) => string;
  };
  validators: {
    restApiUrl: string;
    handleBaseUrl: string;
  };
  oai: {
    handleBaseUrlRequired: string;
    handleBaseUrlInvalid: string;
    handleBaseUrlProtocol: string;
    invalidOaiIdentifier: (value: string) => string;
    missingRepositoryDomain: string;
    missingHandleSuffix: string;
    handleSuffixRequiresSlash: (value: string) => string;
  };
  importer: {
    unexpectedError: string;
    startingSession: string;
    importCancelled: string;
    searchingItem: (uri: string) => string;
    pidResolved: (handle: string) => string;
    discoveryFallback: (handle: string) => string;
    itemNotFound: string;
    noItemMatched: string;
    multipleItemsFound: string;
    moreThanOneItemMatched: string;
    itemFound: (uuid: string) => string;
    readyForExport: string;
  };
  statuses: Record<string, string>;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    app: {
      title: "DSpace Dark Importer",
      subtitle: "Map repository items and generate a dARK CSV",
      languageLabel: "Language",
      english: "English",
      portuguese: "Português",
      toggleTheme: "Toggle theme"
    },
    footer: {
      ariaLabel: "Application links",
      howItWorks: "How it works",
      tutorial: "Video tutorial",
      privacyPolicy: "Privacy Policy",
      github: "GitHub",
      feedback: "Contact, feedback, or bug",
      rightsReserved: "All Rights Reserved."
    },
    pages: {
      howItWorks: {
        title: "How It Works",
        description: "The app maps dARKs to DSpace items and generates an administrative import CSV without modifying DSpace.",
        prerequisiteTitle: "Prerequisite: register the dARK metadata field",
        prerequisiteBody: "Before importing the generated file into DSpace, an administrator must add dc.identifier.dark to the repository's DC metadata registry. In DSpace, open Registries → Metadata → DC.",
        compatibilityTitle: "DSpace 7+ only",
        compatibilityBody: "The DSpace dARK Importer works only with DSpace 7 and newer REST APIs. Earlier versions do not provide the Discovery endpoint used for item lookup.",
        stepsTitle: "Import flow",
        steps: [
          {
            title: "1. Configure the repository",
            body: "Enter the DSpace REST API URL and the repository Handle base URL."
          },
          {
            title: "2. Upload the CSV",
            body: "Upload a .csv file with the headers oai_identifier and dark. Blank lines are ignored."
          },
          {
            title: "3. Validate the CSV",
            body: "The app checks required columns, empty values, duplicate OAI identifiers, malformed OAI identifiers, and duplicate dARKs as warnings."
          },
          {
            title: "4. Process rows",
            body: "The app processes each valid CSV row independently.",
            details: [
              "4.1 For each row, it extracts the Handle from the OAI identifier and resolves it through the DSpace PID endpoint.",
              "4.2 If PID resolution is unavailable, it uses an exact Discovery search as fallback; DSpace is never modified."
            ]
          },
          {
            title: "5. Review and import the output",
            body: "The Results screen summarizes export-ready, not found, multiple match, and error counts, then lets you download items-darks.csv and report.csv."
          }
        ],
        csvExampleTitle: "CSV format",
        csvExampleDescription: "Use exactly these required headers:",
        reportTitle: "Result report",
        reportBody: "The report contains the original OAI identifier, generated URI, dARK, matched item UUID, item handle, final status, and message."
      },
      privacy: {
        title: "Privacy Policy",
        description: "This application is designed to run in your browser with a same-port Next.js proxy to your configured DSpace API.",
        sections: [
          {
            title: "Data you provide",
            body: "The app uses the DSpace REST API URL, repository Handle base URL, and uploaded CSV rows only to map items and generate CSV files."
          },
          {
            title: "Browser local storage",
            body: "User-provided data, such as the server URL, configuration values, theme, and language preference, is stored only in the user's browser local storage."
          },
          {
            title: "Read-only access",
            body: "The application makes read-only Discovery requests and cannot create metadata fields or update DSpace items."
          },
          {
            title: "Server",
            body: "The server only forwards read-only requests to the DSpace API URL submitted in the UI. It does not store CSV contents, DSpace API responses, or import reports."
          },
          {
            title: "External services",
            body: "The importer does not send repository data to the project GitHub repository. GitHub links are provided only for source code, feedback, and bug reports."
          },
          {
            title: "Administrator responsibility",
            body: "Repository administrators are responsible for using valid credentials, reviewing CSV contents before processing, and confirming that metadata updates comply with their institution's policies."
          }
        ]
      },
      tutorial: {
        title: "Video Tutorial",
        description: "Use this workflow to generate a read-only item mapping CSV. The embedded video predates this workflow; follow the written steps below for the current behavior.",
        prerequisiteTitle: "Before you begin",
        prerequisiteBody: "An administrator must create dc.identifier.dark in the DC metadata registry before importing the generated CSV into DSpace.",
        workflow: ["Configure the DSpace REST API URL and the Handle base URL.", "Upload a CSV with the headers oai_identifier,dark.", "Process the file; the app resolves each extracted Handle through PID and never changes DSpace objects.", "Download items-darks.csv with the headers id,dc.identifier.dark and import it through the administrator workflow."],
        videoLabel: "Legacy DSpace dARK Importer video tutorial",
        openOnYoutube: "Open on YouTube"
      }
    },
    steps: {
      configuration: "Configuration",
      validation: "CSV Validation",
      processing: "Processing",
      results: "Results",
      ariaLabel: "Import steps"
    },
    common: {
      back: "Back",
      cancel: "Cancel",
      continue: "Continue",
      errors: "Errors",
      field: "Field",
      invalid: "Invalid",
      message: "Message",
      multiple: "Multiple",
      notFound: "Not Found",
      remaining: "Remaining",
      row: "row",
      rows: "rows",
      severity: "Severity",
      skipped: "Skipped",
      start: "Start",
      status: "Status",
      time: "Time",
      total: "Total",
      totalRows: "Total Rows",
      updated: "Updated",
      readyForExport: "Ready for export",
      valid: "Valid",
      warnings: "Warnings",
      closeModal: "Close modal"
    },
    configuration: {
      title: "Configuration",
      description: "Repository connection and Handle URI configuration.",
      restApiUrl: "DSpace REST API URL",
      handleBaseUrl: "Repository Handle base URL",
      csvUploadTitle: "CSV Upload",
      csvUploadDescription: "Required columns: oai_identifier and dark.",
      chooseCsvFile: "Choose CSV file",
      csvOnly: ".csv only",
      parsingCsv: "Parsing CSV",
      noFileSelected: "No file selected",
      unableToParseCsv: "Unable to parse the CSV file.",
      uploadBeforeContinuing: "Upload a CSV file before continuing."
    },
    validation: {
      title: "CSV Validation",
      uploadBeforeValidation: "Upload a CSV file before validation.",
      validationPassed: "Validation passed. The CSV mapping is ready to run.",
      resolveValidationErrors: "Resolve validation errors before processing.",
      noValidationIssues: "No validation issues found.",
      backToConfiguration: "Back to Configuration",
      startImport: "Start mapping",
      modalTitle: "Start item mapping",
      modalDescription: "Confirm before searching repository items.",
      modalWarningTitle: "This processing run only reads from DSpace.",
      modalWarningText: (count, rowWord, metadataField) =>
        `The app will process ${count} valid ${rowWord} and create ${metadataField} for the matched items.`,
      startProcessing: "Start Processing",
      issueSeverity: {
        error: "error",
        warning: "warning"
      }
    },
    processing: {
      title: "Processing",
      uploadAndValidateBeforeProcessing: "Upload and validate a CSV file before processing.",
      progressDescription: (processed, total) => `Processing ${processed} of ${total} items`,
      waitingToStart: "Waiting to start.",
      viewResults: "View Results",
      logRow: "row",
      statuses: {
        idle: "idle",
        authenticating: "authenticating",
        processing: "processing",
        completed: "completed",
        cancelled: "cancelled"
      },
      stats: {
        total: "Total",
        processed: "Processed",
        updated: "Updated",
        skipped: "Skipped",
        readyForExport: "Ready for export",
        notFound: "Not Found",
        multiple: "Multiple",
        errors: "Errors",
        remaining: "Remaining"
      }
    },
    results: {
      title: "Results",
      description: "Execution report for the latest import session.",
      noReport: "No execution report is available yet.",
      newImport: "New Import",
      downloadReport: "Download report.csv",
      downloadItemsDarks: "Download items-darks.csv",
      columns: {
        oaiIdentifier: "OAI Identifier",
        generatedUri: "Generated URI",
        darkId: "dARK",
        itemUuid: "Item UUID",
        status: "Status",
        message: "Message"
      }
    },
    csv: {
      uploadCsvFile: "Upload a .csv file.",
      csvCouldNotBeParsed: "The CSV could not be parsed.",
      uploadBeforeContinuing: "Upload a CSV file before continuing.",
      missingRequiredColumn: (column) => `Missing required column "${column}".`,
      oaiIdentifierRequired: "OAI identifier is required.",
      malformedOaiIdentifier: "Malformed OAI identifier.",
      darkIdRequired: "dARK is required.",
      duplicateOaiIdentifier: (identifier, rows) => `Duplicate OAI identifier "${identifier}" appears on rows ${rows}.`,
      duplicateDarkId: (darkId, rows) => `Duplicate dARK "${darkId}" appears on rows ${rows}.`
    },
    validators: {
      restApiUrl: "Enter a valid DSpace REST API URL.",
      handleBaseUrl: "Enter a valid Handle Base URL.",
    },
    oai: {
      handleBaseUrlRequired: "Handle Base URL is required.",
      handleBaseUrlInvalid: "Handle Base URL must be a valid HTTP or HTTPS URL.",
      handleBaseUrlProtocol: "Handle Base URL must use HTTP or HTTPS.",
      invalidOaiIdentifier: (value) => `Invalid OAI identifier "${value}". Expected format: oai:<repository-domain>:<handle>.`,
      missingRepositoryDomain: "OAI identifier is missing the repository domain.",
      missingHandleSuffix: "OAI identifier is missing the handle suffix.",
      handleSuffixRequiresSlash: (value) => `Invalid OAI identifier "${value}". Handle suffix must include a slash, such as prefix/id.`
    },
    importer: {
      unexpectedError: "Unexpected error.",
      startingSession: "Starting import session.",
      importCancelled: "Import cancelled.",
      searchingItem: (uri) => `Searching item for ${uri}.`,
      pidResolved: (handle) => `PID resolved Handle ${handle}.`,
      discoveryFallback: (handle) => `PID could not resolve Handle ${handle}; using Discovery fallback.`,
      itemNotFound: "Item not found.",
      noItemMatched: "No item matched the generated URI.",
      multipleItemsFound: "Multiple matching items found.",
      moreThanOneItemMatched: "More than one item matched the generated URI.",
      itemFound: (uuid) => `Item found: ${uuid}.`,
      readyForExport: "Item mapped and ready for export."
    },
    statuses: {
      UPDATED: "UPDATED",
      "READY FOR EXPORT": "READY FOR EXPORT",
      SKIPPED: "SKIPPED",
      "NOT FOUND": "NOT FOUND",
      "MULTIPLE MATCHES": "MULTIPLE MATCHES",
      "API ERROR": "API ERROR",
      "VALIDATION ERROR": "VALIDATION ERROR",
      "AUTHENTICATION ERROR": "AUTHENTICATION ERROR",
      "NETWORK ERROR": "NETWORK ERROR"
    }
  },
  pt: {
    app: {
      title: "Importador de dARK para DSpace",
      subtitle: "Mapeie itens do repositório e gere um CSV de dARKs",
      languageLabel: "Idioma",
      english: "English",
      portuguese: "Português",
      toggleTheme: "Alternar tema"
    },
    footer: {
      ariaLabel: "Links da aplicação",
      howItWorks: "Como funciona",
      tutorial: "Tutorial em vídeo",
      privacyPolicy: "Política de Privacidade",
      github: "GitHub",
      feedback: "Contato, feedback ou bug",
      rightsReserved: "All Rights Reserved."
    },
    pages: {
      howItWorks: {
        title: "Como Funciona",
        description: "A aplicação mapeia dARKs para itens do DSpace e gera um CSV para importação administrativa, sem alterar o DSpace.",
        prerequisiteTitle: "Pré-condição: cadastrar o campo de metadado dARK",
        prerequisiteBody: "Antes de importar o arquivo gerado no DSpace, um administrador deve adicionar dc.identifier.dark ao registro de metadados DC do repositório. No DSpace, acesse Registros → Metadados → DC.",
        compatibilityTitle: "Somente DSpace 7+",
        compatibilityBody: "O Importador de dARK para DSpace funciona somente com as APIs REST do DSpace 7 ou superior. Versões anteriores não oferecem o endpoint Discovery usado para localizar itens.",
        stepsTitle: "Fluxo de importação",
        steps: [
          {
            title: "1. Configure o repositório",
            body: "Informe a URL da API REST do DSpace e a URL base do Handle do repositório."
          },
          {
            title: "2. Envie o CSV",
            body: "Envie um arquivo .csv com os cabeçalhos oai_identifier e dark. Linhas em branco são ignoradas."
          },
          {
            title: "3. Valide o CSV",
            body: "A aplicação verifica colunas obrigatórias, valores vazios, identificadores OAI duplicados, identificadores OAI malformados e dARKs duplicados como avisos."
          },
          {
            title: "4. Processe as linhas",
            body: "A aplicação processa cada linha válida do CSV de forma independente.",
            details: [
              "4.1 Para cada linha, extrai o Handle do identificador OAI e o resolve pelo endpoint PID do DSpace.",
              "4.2 Se a resolução PID não estiver disponível, usa uma busca Discovery exata como alternativa; o DSpace nunca é alterado."
            ]
          },
          {
            title: "5. Revise e importe a saída",
            body: "A tela de Resultados resume itens atualizados, ignorados, não encontrados, múltiplas correspondências e erros, e permite baixar o report.csv para auditoria."
          }
        ],
        csvExampleTitle: "Formato do CSV",
        csvExampleDescription: "Use exatamente estes cabeçalhos obrigatórios:",
        reportTitle: "Relatório de resultado",
        reportBody: "O relatório contém o identificador OAI original, a URI gerada, o dARK, o UUID do item encontrado, o handle do item, o status final e a mensagem."
      },
      privacy: {
        title: "Política de Privacidade",
        description: "Esta aplicação foi projetada para rodar no navegador com um proxy Next.js na mesma porta para a API DSpace configurada.",
        sections: [
          {
            title: "Dados informados",
            body: "A aplicação usa a URL da API REST do DSpace, a URL base do Handle do repositório e as linhas do CSV enviado apenas para mapear itens e gerar arquivos CSV."
          },
          {
            title: "Armazenamento local do navegador",
            body: "Os dados informados pelo usuário, como URL do servidor, valores de configuração, tema e preferência de idioma, são armazenados somente no armazenamento local do navegador do usuário."
          },
          {
            title: "Acesso somente leitura",
            body: "A aplicação faz apenas consultas Discovery e não pode criar campos de metadados nem atualizar itens do DSpace."
          },
          {
            title: "Servidor",
            body: "O servidor apenas encaminha requisições de leitura para a URL da API DSpace informada na UI. Ele não armazena conteúdos do CSV, respostas da API DSpace nem relatórios de importação."
          },
          {
            title: "Serviços externos",
            body: "O importador não envia dados do repositório para o GitHub do projeto. Os links do GitHub são fornecidos apenas para código-fonte, feedback e relatos de bugs."
          },
          {
            title: "Responsabilidade do administrador",
            body: "Administradores do repositório são responsáveis por usar credenciais válidas, revisar o conteúdo do CSV antes do processamento e confirmar que as atualizações de metadados seguem as políticas da instituição."
          }
        ]
      },
      tutorial: {
        title: "Tutorial em Vídeo",
        description: "Use este fluxo para gerar um CSV de mapeamento somente leitura. O vídeo incorporado é anterior a este fluxo; siga as etapas escritas abaixo para o comportamento atual.",
        prerequisiteTitle: "Antes de começar",
        prerequisiteBody: "Um administrador deve criar dc.identifier.dark no registro de metadados DC antes de importar o CSV gerado no DSpace.",
        workflow: ["Configure a URL da API REST do DSpace e a URL base do Handle.", "Envie um CSV com os cabeçalhos oai_identifier,dark.", "Processe o arquivo; a aplicação resolve cada Handle extraído pelo PID e nunca altera objetos do DSpace.", "Baixe items-darks.csv com os cabeçalhos id,dc.identifier.dark e importe-o pelo fluxo administrativo."],
        videoLabel: "Tutorial em vídeo legado do Importador de dARK para DSpace",
        openOnYoutube: "Abrir no YouTube"
      }
    },
    steps: {
      configuration: "Configuração",
      validation: "Validação do CSV",
      processing: "Processamento",
      results: "Resultados",
      ariaLabel: "Etapas da importação"
    },
    common: {
      back: "Voltar",
      cancel: "Cancelar",
      continue: "Continuar",
      errors: "Erros",
      field: "Campo",
      invalid: "Inválidos",
      message: "Mensagem",
      multiple: "Múltiplos",
      notFound: "Não encontrados",
      remaining: "Restantes",
      row: "linha",
      rows: "linhas",
      severity: "Severidade",
      skipped: "Ignorados",
      start: "Iniciar",
      status: "Status",
      time: "Tempo",
      total: "Total",
      totalRows: "Total de linhas",
      updated: "Atualizados",
      readyForExport: "Prontos para exportação",
      valid: "Válidos",
      warnings: "Avisos",
      closeModal: "Fechar modal"
    },
    configuration: {
      title: "Configuração",
      description: "Conexão do repositório e configuração da URI Handle.",
      restApiUrl: "URL da API REST do DSpace",
      handleBaseUrl: "URL base do Handle do repositório",
      csvUploadTitle: "Envio do CSV",
      csvUploadDescription: "Colunas obrigatórias: oai_identifier e dark.",
      chooseCsvFile: "Escolher arquivo CSV",
      csvOnly: "somente .csv",
      parsingCsv: "Lendo CSV",
      noFileSelected: "Nenhum arquivo selecionado",
      unableToParseCsv: "Não foi possível ler o arquivo CSV.",
      uploadBeforeContinuing: "Envie um arquivo CSV antes de continuar."
    },
    validation: {
      title: "Validação do CSV",
      uploadBeforeValidation: "Envie um arquivo CSV antes da validação.",
      validationPassed: "Validação concluída. O mapeamento do CSV está pronto para iniciar.",
      resolveValidationErrors: "Resolva os erros de validação antes de processar.",
      noValidationIssues: "Nenhum problema de validação encontrado.",
      backToConfiguration: "Voltar para configuração",
      startImport: "Iniciar mapeamento",
      modalTitle: "Iniciar mapeamento de itens",
      modalDescription: "Confirme antes de buscar itens no repositório.",
      modalWarningTitle: "Este processamento apenas consulta o DSpace.",
      modalWarningText: (count, rowWord, metadataField) =>
        `A aplicação processará ${count} ${rowWord} válidas e criará ${metadataField} para os itens encontrados.`,
      startProcessing: "Iniciar processamento",
      issueSeverity: {
        error: "erro",
        warning: "aviso"
      }
    },
    processing: {
      title: "Processamento",
      uploadAndValidateBeforeProcessing: "Envie e valide um arquivo CSV antes de processar.",
      progressDescription: (processed, total) => `Processando ${processed} de ${total} itens`,
      waitingToStart: "Aguardando início.",
      viewResults: "Ver resultados",
      logRow: "linha",
      statuses: {
        idle: "parado",
        authenticating: "autenticando",
        processing: "processando",
        completed: "concluído",
        cancelled: "cancelado"
      },
      stats: {
        total: "Total",
        processed: "Processados",
        updated: "Atualizados",
        skipped: "Ignorados",
        readyForExport: "Prontos para exportação",
        notFound: "Não encontrados",
        multiple: "Múltiplos",
        errors: "Erros",
        remaining: "Restantes"
      }
    },
    results: {
      title: "Resultados",
      description: "Relatório de execução da importação mais recente.",
      noReport: "Nenhum relatório de execução está disponível ainda.",
      newImport: "Nova importação",
      downloadReport: "Baixar report.csv",
      downloadItemsDarks: "Baixar items-darks.csv",
      columns: {
        oaiIdentifier: "Identificador OAI",
        generatedUri: "URI gerada",
        darkId: "dARK",
        itemUuid: "UUID do item",
        status: "Status",
        message: "Mensagem"
      }
    },
    csv: {
      uploadCsvFile: "Envie um arquivo .csv.",
      csvCouldNotBeParsed: "Não foi possível ler o CSV.",
      uploadBeforeContinuing: "Envie um arquivo CSV antes de continuar.",
      missingRequiredColumn: (column) => `Coluna obrigatória ausente "${column}".`,
      oaiIdentifierRequired: "O identificador OAI é obrigatório.",
      malformedOaiIdentifier: "Identificador OAI malformado.",
      darkIdRequired: "O dARK é obrigatório.",
      duplicateOaiIdentifier: (identifier, rows) => `O identificador OAI duplicado "${identifier}" aparece nas linhas ${rows}.`,
      duplicateDarkId: (darkId, rows) => `O dARK duplicado "${darkId}" aparece nas linhas ${rows}.`
    },
    validators: {
      restApiUrl: "Informe uma URL válida da API REST do DSpace.",
      handleBaseUrl: "Informe uma URL base de Handle válida.",
    },
    oai: {
      handleBaseUrlRequired: "A URL base do Handle é obrigatória.",
      handleBaseUrlInvalid: "A URL base do Handle deve ser uma URL HTTP ou HTTPS válida.",
      handleBaseUrlProtocol: "A URL base do Handle deve usar HTTP ou HTTPS.",
      invalidOaiIdentifier: (value) => `Identificador OAI inválido "${value}". Formato esperado: oai:<domínio-do-repositório>:<handle>.`,
      missingRepositoryDomain: "O identificador OAI não contém o domínio do repositório.",
      missingHandleSuffix: "O identificador OAI não contém o sufixo do Handle.",
      handleSuffixRequiresSlash: (value) => `Identificador OAI inválido "${value}". O sufixo do Handle deve conter uma barra, como prefixo/id.`
    },
    importer: {
      unexpectedError: "Erro inesperado.",
      startingSession: "Iniciando sessão de importação.",
      importCancelled: "Importação cancelada.",
      searchingItem: (uri) => `Buscando item para ${uri}.`,
      pidResolved: (handle) => `PID resolveu o Handle ${handle}.`,
      discoveryFallback: (handle) => `PID não resolveu o Handle ${handle}; usando busca Discovery alternativa.`,
      itemNotFound: "Item não encontrado.",
      noItemMatched: "Nenhum item correspondeu à URI gerada.",
      multipleItemsFound: "Vários itens correspondentes encontrados.",
      moreThanOneItemMatched: "Mais de um item correspondeu à URI gerada.",
      itemFound: (uuid) => `Item encontrado: ${uuid}.`,
      readyForExport: "Item mapeado e pronto para exportação."
    },
    statuses: {
      UPDATED: "ATUALIZADO",
      "READY FOR EXPORT": "PRONTO PARA EXPORTAÇÃO",
      SKIPPED: "IGNORADO",
      "NOT FOUND": "NÃO ENCONTRADO",
      "MULTIPLE MATCHES": "MÚLTIPLOS RESULTADOS",
      "API ERROR": "ERRO DA API",
      "VALIDATION ERROR": "ERRO DE VALIDAÇÃO",
      "AUTHENTICATION ERROR": "ERRO DE AUTENTICAÇÃO",
      "NETWORK ERROR": "ERRO DE REDE"
    }
  }
};

export const defaultLanguage: Language = "en";
