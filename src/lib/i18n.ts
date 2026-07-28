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
    valid: string;
    warnings: string;
    closeModal: string;
  };
  configuration: {
    title: string;
    description: string;
    restApiUrl: string;
    handleBaseUrl: string;
    metadataFieldToUpdate: string;
    bearerToken: string;
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
    metadataFieldRequired: string;
    invalidMetadataField: string;
    restApiUrl: string;
    handleBaseUrl: string;
    bearerToken: string;
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
    bearerConfigured: string;
    metadataFieldCreated: (field: string) => string;
    metadataFieldVerified: (field: string) => string;
    importCancelled: string;
    searchingItem: (uri: string) => string;
    itemNotFound: string;
    noItemMatched: string;
    multipleItemsFound: string;
    moreThanOneItemMatched: string;
    itemFound: (uuid: string) => string;
    metadataAlreadyExistsLog: string;
    metadataAlreadyExistsReport: string;
    metadataUpdated: string;
    metadataAppended: string;
  };
  statuses: Record<string, string>;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    app: {
      title: "DSpace Dark ID Importer",
      subtitle: "Bulk append metadata to existing items",
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
        description: "The importer follows a controlled five-step flow so each CSV row can succeed, skip, or fail independently.",
        compatibilityTitle: "DSpace 7+ only",
        compatibilityBody: "The DSpace dARK ID Importer works only with DSpace 7 and newer REST APIs. Earlier DSpace versions do not provide the required REST endpoints for Discovery search, metadata registry checks, and JSON Patch item updates.",
        stepsTitle: "Import flow",
        steps: [
          {
            title: "1. Configure the repository",
            body: "Enter the DSpace REST API URL, the repository Handle base URL, the Bearer token, and the metadata field name used to store dARK IDs."
          },
          {
            title: "2. Upload the CSV",
            body: "Upload a .csv file with the headers oai_identifier and dark_id. Blank lines are ignored."
          },
          {
            title: "3. Validate the CSV",
            body: "The app checks required columns, empty values, duplicate OAI identifiers, malformed OAI identifiers, and duplicate dARK IDs as warnings."
          },
          {
            title: "4. Process rows",
            body: "The app processes each valid CSV row independently.",
            details: [
              "4.1 Verifies whether the configured metadata field exists in DSpace and creates it when missing.",
              "4.2 For each row, it builds the Handle URI from the OAI identifier and searches the item by that URI.",
              "4.3 Appends the metadata only when needed, and skips the row when the item already has the same dARK ID."
            ]
          },
          {
            title: "5. Review the report",
            body: "The Results screen summarizes updated, skipped, not found, multiple match, and error counts, then lets you download report.csv for auditing."
          }
        ],
        csvExampleTitle: "CSV format",
        csvExampleDescription: "Use exactly these required headers:",
        reportTitle: "Result report",
        reportBody: "The report contains the original OAI identifier, generated URI, dARK ID, matched item UUID, item handle, final status, and message."
      },
      privacy: {
        title: "Privacy Policy",
        description: "This application is designed to run in your browser with a same-port Next.js proxy to your configured DSpace API.",
        sections: [
          {
            title: "Data you provide",
            body: "The app uses the DSpace REST API URL, repository Handle base URL, Bearer token, metadata field name, and uploaded CSV rows only to perform the import workflow."
          },
          {
            title: "Browser local storage",
            body: "User-provided data, such as the server URL, token, configuration values, theme, and language preference, is stored only in the user's browser local storage."
          },
          {
            title: "DSpace token",
            body: "The DSpace Dark ID Importer uses a Bearer token instead of asking for a username and password. This is safer because the app never needs to collect or transmit the user's password, and repository administrators can revoke or rotate tokens without changing the user's main credentials. Token validity is controlled by the DSpace server configuration and by the token's own expiration; the importer does not extend or renew it. When a token expires, DSpace will reject API requests and the user must provide a valid token again."
          },
          {
            title: "Server",
            body: "The server only forwards requests to the DSpace API URL submitted in the UI. It does not store CSV contents, Bearer tokens, DSpace API responses, or import reports."
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
        description: "Watch the tutorial to see how to configure the importer, upload the CSV, validate rows, process metadata updates, and review the report.",
        videoLabel: "DSpace dARK ID Importer video tutorial",
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
      valid: "Valid",
      warnings: "Warnings",
      closeModal: "Close modal"
    },
    configuration: {
      title: "Configuration",
      description: "Repository connection, authentication, and metadata fields.",
      restApiUrl: "DSpace REST API URL",
      handleBaseUrl: "Repository Handle Base URL",
      metadataFieldToUpdate: "Metadata Field to Update",
      bearerToken: "Bearer Token",
      csvUploadTitle: "CSV Upload",
      csvUploadDescription: "Required columns: oai_identifier and dark_id.",
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
      validationPassed: "Validation passed. The import is ready to run.",
      resolveValidationErrors: "Resolve validation errors before processing.",
      noValidationIssues: "No validation issues found.",
      backToConfiguration: "Back to Configuration",
      startImport: "Start Import",
      modalTitle: "Start Metadata Import",
      modalDescription: "Confirm before changing repository items.",
      modalWarningTitle: "This processing run will change DSpace items.",
      modalWarningText: (count, rowWord, metadataField) =>
        `The importer will process ${count} valid ${rowWord} and add metadata ${metadataField} where the value is not already present.`,
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
      columns: {
        oaiIdentifier: "OAI Identifier",
        generatedUri: "Generated URI",
        darkId: "dARK ID",
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
      darkIdRequired: "dARK ID is required.",
      duplicateOaiIdentifier: (identifier, rows) => `Duplicate OAI identifier "${identifier}" appears on rows ${rows}.`,
      duplicateDarkId: (darkId, rows) => `Duplicate dARK ID "${darkId}" appears on rows ${rows}.`
    },
    validators: {
      metadataFieldRequired: "Metadata field is required.",
      invalidMetadataField: "Use a valid DSpace metadata field, such as dc.identifier.uri.",
      restApiUrl: "Enter a valid DSpace REST API URL.",
      handleBaseUrl: "Enter a valid Handle Base URL.",
      bearerToken: "Bearer token is required."
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
      bearerConfigured: "Bearer token configured. DSpace will validate it on API requests.",
      metadataFieldCreated: (field) => `Metadata field created: ${field}.`,
      metadataFieldVerified: (field) => `Metadata field verified: ${field}.`,
      importCancelled: "Import cancelled.",
      searchingItem: (uri) => `Searching item for ${uri}.`,
      itemNotFound: "Item not found.",
      noItemMatched: "No item matched the generated URI.",
      multipleItemsFound: "Multiple matching items found.",
      moreThanOneItemMatched: "More than one item matched the generated URI.",
      itemFound: (uuid) => `Item found: ${uuid}.`,
      metadataAlreadyExistsLog: "Metadata value already exists. Skipping row.",
      metadataAlreadyExistsReport: "Metadata value already exists on item.",
      metadataUpdated: "Metadata updated.",
      metadataAppended: "Metadata value appended."
    },
    statuses: {
      UPDATED: "UPDATED",
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
      title: "Importador de dARK ID para DSpace",
      subtitle: "Adicione metadados em lote a itens existentes",
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
        description: "O importador segue um fluxo controlado em cinco etapas para que cada linha do CSV possa ser atualizada, ignorada ou falhar de forma independente.",
        compatibilityTitle: "Somente DSpace 7+",
        compatibilityBody: "O Importador de dARK ID para DSpace funciona somente com as APIs REST do DSpace 7 ou superior. Versões anteriores do DSpace não oferecem os endpoints REST necessários para busca Discovery, verificação do registro de metadados e atualização de itens com JSON Patch.",
        stepsTitle: "Fluxo de importação",
        steps: [
          {
            title: "1. Configure o repositório",
            body: "Informe a URL da API REST do DSpace, a URL base do Handle do repositório, o token Bearer e o nome do campo de metadado usado para armazenar os dARK IDs."
          },
          {
            title: "2. Envie o CSV",
            body: "Envie um arquivo .csv com os cabeçalhos oai_identifier e dark_id. Linhas em branco são ignoradas."
          },
          {
            title: "3. Valide o CSV",
            body: "A aplicação verifica colunas obrigatórias, valores vazios, identificadores OAI duplicados, identificadores OAI malformados e dARK IDs duplicados como avisos."
          },
          {
            title: "4. Processe as linhas",
            body: "A aplicação processa cada linha válida do CSV de forma independente.",
            details: [
              "4.1 Verifica se o campo de metadado configurado existe no DSpace e o cria quando estiver ausente.",
              "4.2 Para cada linha, gera a URI Handle a partir do identificador OAI e busca o item por essa URI.",
              "4.3 Adiciona o metadado somente quando necessário, e ignora a linha quando o item já possui o mesmo dARK ID."
            ]
          },
          {
            title: "5. Revise o relatório",
            body: "A tela de Resultados resume itens atualizados, ignorados, não encontrados, múltiplas correspondências e erros, e permite baixar o report.csv para auditoria."
          }
        ],
        csvExampleTitle: "Formato do CSV",
        csvExampleDescription: "Use exatamente estes cabeçalhos obrigatórios:",
        reportTitle: "Relatório de resultado",
        reportBody: "O relatório contém o identificador OAI original, a URI gerada, o dARK ID, o UUID do item encontrado, o handle do item, o status final e a mensagem."
      },
      privacy: {
        title: "Política de Privacidade",
        description: "Esta aplicação foi projetada para rodar no navegador com um proxy Next.js na mesma porta para a API DSpace configurada.",
        sections: [
          {
            title: "Dados informados",
            body: "A aplicação usa a URL da API REST do DSpace, a URL base do Handle do repositório, o token Bearer, o nome do campo de metadado e as linhas do CSV enviado apenas para executar o fluxo de importação."
          },
          {
            title: "Armazenamento local do navegador",
            body: "Os dados informados pelo usuário, como URL do servidor, token, valores de configuração, tema e preferência de idioma, são armazenados somente no armazenamento local do navegador do usuário."
          },
          {
            title: "Token do DSpace",
            body: "O Importador de dARK ID para DSpace usa um token Bearer em vez de solicitar usuário e senha. Isso é mais seguro porque a aplicação não precisa coletar nem transmitir a senha do usuário, e administradores do repositório podem revogar ou trocar tokens sem alterar as credenciais principais do usuário. A validade do token é controlada pela configuração do servidor DSpace e pela expiração do próprio token; o importador não estende nem renova essa validade. Quando o token expira, o DSpace rejeita as requisições da API e o usuário precisa informar um token válido novamente."
          },
          {
            title: "Servidor",
            body: "O servidor apenas encaminha as requisições para a URL da API DSpace informada na UI. Ele não armazena conteúdos do CSV, tokens Bearer, respostas da API DSpace nem relatórios de importação."
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
        description: "Assista ao tutorial para ver como configurar o importador, enviar o CSV, validar as linhas, processar as atualizações de metadados e revisar o relatório.",
        videoLabel: "Tutorial em vídeo do Importador de dARK ID para DSpace",
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
      valid: "Válidos",
      warnings: "Avisos",
      closeModal: "Fechar modal"
    },
    configuration: {
      title: "Configuração",
      description: "Conexão do repositório, autenticação e campos de metadados.",
      restApiUrl: "URL da API REST do DSpace",
      handleBaseUrl: "URL base do Handle do repositório",
      metadataFieldToUpdate: "Campo de metadado a atualizar",
      bearerToken: "Token Bearer",
      csvUploadTitle: "Envio do CSV",
      csvUploadDescription: "Colunas obrigatórias: oai_identifier e dark_id.",
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
      validationPassed: "Validação concluída. A importação está pronta para iniciar.",
      resolveValidationErrors: "Resolva os erros de validação antes de processar.",
      noValidationIssues: "Nenhum problema de validação encontrado.",
      backToConfiguration: "Voltar para configuração",
      startImport: "Iniciar importação",
      modalTitle: "Iniciar importação de metadados",
      modalDescription: "Confirme antes de alterar itens do repositório.",
      modalWarningTitle: "Este processamento alterará itens do DSpace.",
      modalWarningText: (count, rowWord, metadataField) =>
        `O importador processará ${count} ${rowWord} válidas e adicionará o metadado ${metadataField} quando o valor ainda não existir.`,
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
      columns: {
        oaiIdentifier: "Identificador OAI",
        generatedUri: "URI gerada",
        darkId: "dARK ID",
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
      darkIdRequired: "O dARK ID é obrigatório.",
      duplicateOaiIdentifier: (identifier, rows) => `O identificador OAI duplicado "${identifier}" aparece nas linhas ${rows}.`,
      duplicateDarkId: (darkId, rows) => `O dARK ID duplicado "${darkId}" aparece nas linhas ${rows}.`
    },
    validators: {
      metadataFieldRequired: "O campo de metadado é obrigatório.",
      invalidMetadataField: "Use um campo de metadado DSpace válido, como dc.identifier.uri.",
      restApiUrl: "Informe uma URL válida da API REST do DSpace.",
      handleBaseUrl: "Informe uma URL base de Handle válida.",
      bearerToken: "O token Bearer é obrigatório."
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
      bearerConfigured: "Token Bearer configurado. O DSpace validará o token nas requisições da API.",
      metadataFieldCreated: (field) => `Campo de metadado criado: ${field}.`,
      metadataFieldVerified: (field) => `Campo de metadado verificado: ${field}.`,
      importCancelled: "Importação cancelada.",
      searchingItem: (uri) => `Buscando item para ${uri}.`,
      itemNotFound: "Item não encontrado.",
      noItemMatched: "Nenhum item correspondeu à URI gerada.",
      multipleItemsFound: "Vários itens correspondentes encontrados.",
      moreThanOneItemMatched: "Mais de um item correspondeu à URI gerada.",
      itemFound: (uuid) => `Item encontrado: ${uuid}.`,
      metadataAlreadyExistsLog: "O valor do metadado já existe. Ignorando linha.",
      metadataAlreadyExistsReport: "O valor do metadado já existe no item.",
      metadataUpdated: "Metadado atualizado.",
      metadataAppended: "Valor de metadado adicionado."
    },
    statuses: {
      UPDATED: "ATUALIZADO",
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
