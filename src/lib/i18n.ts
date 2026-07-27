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
