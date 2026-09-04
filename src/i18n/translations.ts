export type Language = 'en' | 'de';

export interface Translations {
  nav: {
    dashboard: string;
    invoices: string;
    offers: string;
    clients: string;
    windows: string;
    products: string;
    payments: string;
    emailHistory: string;
    settings: string;
    newInvoice: string;
    newOffer: string;
    newClient: string;
    recordPayment: string;
    collapse: string;
    expand: string;
    quickAction: string;
    stylesCount: string;
  };
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    add: string;
    back: string;
    view: string;
    download: string;
    print: string;
    send: string;
    resend: string;
    search: string;
    filter: string;
    all: string;
    status: string;
    actions: string;
    details: string;
    close: string;
    loading: string;
    success: string;
    error: string;
    confirm: string;
    yes: string;
    no: string;
    exportCsv: string;
    importCsv: string;
    reset: string;
    copy: string;
    copied: string;
    preview: string;
    duplicate: string;
    select: string;
    refresh: string;
    total: string;
    subtotal: string;
    vat: string;
    tax: string;
    discount: string;
    notes: string;
    terms: string;
    date: string;
    dueDate: string;
    issueDate: string;
    client: string;
    amount: string;
    paid: string;
    unpaid: string;
    overdue: string;
    draft: string;
    sent: string;
    cancelled: string;
    accepted: string;
    rejected: string;
    expired: string;
    pending: string;
    delivered: string;
    failed: string;
    item: string;
    description: string;
    quantity: string;
    unitPrice: string;
    unit: string;
    piece: string;
    hour: string;
    sqm: string;
    meter: string;
    set: string;
    language: string;
    english: string;
    german: string;
    selectLanguage: string;
    optional: string;
    required: string;
  };
  status: {
    paid: string;
    unpaid: string;
    overdue: string;
    draft: string;
    sent: string;
    cancelled: string;
    accepted: string;
    rejected: string;
    expired: string;
    pending: string;
    delivered: string;
    failed: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    totalRevenue: string;
    outstandingRevenue: string;
    paidInvoices: string;
    pendingOffers: string;
    overdueAlert: string;
    recentInvoices: string;
    recentOffers: string;
    quickStats: string;
    monthlyRevenue: string;
    quickShortcuts: string;
    viewAllInvoices: string;
    viewAllOffers: string;
    collectionRate: string;
    averageInvoice: string;
    activeClients: string;
    catalogItems: string;
    noRecentInvoices: string;
    noRecentOffers: string;
    overdueInvoicesWarning: string;
    resolvedStatus: string;
  };
  invoices: {
    title: string;
    subtitle: string;
    newInvoice: string;
    editInvoice: string;
    invoiceNumber: string;
    invoiceDate: string;
    paymentDueDate: string;
    billTo: string;
    selectClient: string;
    addClientQuick: string;
    lineItems: string;
    addLineItem: string;
    addWindowPreset: string;
    subtotal: string;
    vatTax: string;
    totalAmount: string;
    paymentStatus: string;
    paymentMethod: string;
    paymentTerms: string;
    bankDetails: string;
    invoiceNotes: string;
    footerNotes: string;
    markPaid: string;
    markUnpaid: string;
    sendByEmail: string;
    downloadPdf: string;
    printDoc: string;
    duplicateInvoice: string;
    deleteConfirm: string;
    emptyList: string;
    filterAll: string;
    filterPaid: string;
    filterUnpaid: string;
    filterOverdue: string;
    filterDraft: string;
    itemsCount: string;
    invoiceCreated: string;
    invoiceUpdated: string;
    invoiceDeleted: string;
    recordPayment: string;
    templateStyle: string;
    colorTheme: string;
    backToList: string;
    metrics: {
      totalInvoiced: string;
      collected: string;
      outstanding: string;
      overdue: string;
    };
    searchPlaceholder: string;
    client: string;
    date: string;
    dueDate: string;
    amount: string;
    status: string;
    noInvoices: string;
    sendEmail: string;
    items: string;
  };
  offers: {
    title: string;
    subtitle: string;
    newOffer: string;
    editOffer: string;
    offerNumber: string;
    offerDate: string;
    validUntil: string;
    client: string;
    scopeOfWork: string;
    addLineItem: string;
    addWindowPreset: string;
    totalEstimated: string;
    convertToInvoice: string;
    convertConfirm: string;
    offerAccepted: string;
    offerRejected: string;
    markAccepted: string;
    markRejected: string;
    sendOfferEmail: string;
    downloadOfferPdf: string;
    statusDraft: string;
    statusSent: string;
    statusAccepted: string;
    statusRejected: string;
    statusExpired: string;
    emptyList: string;
    createdSuccess: string;
    convertedSuccess: string;
  };
  windows: {
    title: string;
    subtitle: string;
    totalStyles: string;
    searchPlaceholder: string;
    filterAll: string;
    filterModern: string;
    filterClassic: string;
    filterPanorama: string;
    filterRoof: string;
    filterSpecial: string;
    techSpecs: string;
    uValue: string;
    thermalInsulation: string;
    soundInsulation: string;
    frameDepth: string;
    glazing: string;
    securityClass: string;
    openingType: string;
    material: string;
    basePrice: string;
    dimensions: string;
    width: string;
    height: string;
    configureWindow: string;
    addToOffer: string;
    addToInvoice: string;
    customNotes: string;
    glassType: string;
    frameColor: string;
    white: string;
    anthracite: string;
    goldenOak: string;
    mahogany: string;
    doubleGlazed: string;
    tripleGlazed: string;
    quadGlazed: string;
    tiltTurn: string;
    casement: string;
    sliding: string;
    fixed: string;
    awning: string;
    hopper: string;
    pivot: string;
    bay: string;
    skylight: string;
    french: string;
    arch: string;
    addedToInvoice: string;
    addedToOffer: string;
    calculator: string;
    features: string;
    recommendedUse: string;
  };
  clients: {
    title: string;
    subtitle: string;
    newClient: string;
    editClient: string;
    clientName: string;
    companyName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    vatNumber: string;
    businessNumber: string;
    totalInvoiced: string;
    outstandingBalance: string;
    clientHistory: string;
    noClients: string;
    deleteConfirm: string;
    importSuccess: string;
    clientSaved: string;
    searchPlaceholder: string;
    clientDetails: string;
  };
  products: {
    title: string;
    subtitle: string;
    newProduct: string;
    editProduct: string;
    sku: string;
    name: string;
    category: string;
    price: string;
    unit: string;
    stock: string;
    inStock: string;
    outOfStock: string;
    vatRate: string;
    description: string;
    noProducts: string;
    deleteConfirm: string;
    productSaved: string;
    searchPlaceholder: string;
    catWindows: string;
    catGlass: string;
    catHardware: string;
    catLabor: string;
    catAccessories: string;
  };
  payments: {
    title: string;
    subtitle: string;
    recordPayment: string;
    paymentLedger: string;
    invoiceRef: string;
    paymentDate: string;
    method: string;
    amountReceived: string;
    notes: string;
    paymentRecorded: string;
    methodBankTransfer: string;
    methodCreditCard: string;
    methodPayPal: string;
    methodCash: string;
    methodDirectDebit: string;
    totalCollected: string;
    pendingCollection: string;
    noPayments: string;
    selectInvoice: string;
  };
  email: {
    title: string;
    subtitle: string;
    brevoTitle: string;
    brevoSubtitle: string;
    brevoConnected: string;
    noApiKey: string;
    emailLogs: string;
    recipient: string;
    subject: string;
    sentAt: string;
    document: string;
    status: string;
    inspectMessage: string;
    resend: string;
    clearLogs: string;
    testEmail: string;
    sendTest: string;
    testingKey: string;
    keyValid: string;
    keyInvalid: string;
    verifyKey: string;
    senderName: string;
    senderEmail: string;
    replyTo: string;
    composeEmail: string;
    sendViaBrevo: string;
    emailSuccess: string;
    emailFailed: string;
    htmlPreview: string;
    textPreview: string;
    headersInfo: string;
    noLogs: string;
    searchPlaceholder: string;
    filterType: string;
  };
  settings: {
    title: string;
    subtitle: string;
    saveSettings: string;
    vatRate: string;
    logoPosition: string;
    defaultPaymentInstructions: string;
    tabs: {
      company: string;
      banking: string;
      invoicing: string;
      branding: string;
      email: string;
      language: string;
    };
    sections: {
      businessIdentity: string;
      bankingDetails: string;
      invoiceDefaults: string;
      brandingDesign: string;
      brevoIntegration: string;
      languageLocalization: string;
    };
    fields: {
      businessName: string;
      signatoryName: string;
      businessEmail: string;
      phone: string;
      website: string;
      address: string;
      city: string;
      postalCode: string;
      country: string;
      bankName: string;
      accountHolder: string;
      iban: string;
      swift: string;
      vatNumber: string;
      registrationNumber: string;
      defaultCurrency: string;
      defaultVatRate: string;
      invoicePrefix: string;
      offerPrefix: string;
      defaultDueDays: string;
      latePaymentFee: string;
      paymentTerms: string;
      invoiceTemplate: string;
      brandColor: string;
      fontFamily: string;
      tableStyle: string;
      brevoApiKey: string;
      senderName: string;
      senderEmail: string;
      replyTo: string;
    };
    tabProfile: string;
    tabBanking: string;
    tabInvoicing: string;
    tabDesign: string;
    tabEmail: string;
    tabLanguage: string;
    languageTitle: string;
    languageDesc: string;
    selectAppLanguage: string;
    enLabel: string;
    enDesc: string;
    deLabel: string;
    deDesc: string;
    businessIdentity: string;
    businessName: string;
    ownerName: string;
    businessEmail: string;
    phone: string;
    website: string;
    streetAddress: string;
    city: string;
    postalCode: string;
    country: string;
    bankCoordinates: string;
    bankName: string;
    accountHolder: string;
    iban: string;
    swiftBic: string;
    vatId: string;
    regNumber: string;
    invoiceDefaults: string;
    defaultCurrency: string;
    defaultVat: string;
    invoicePrefix: string;
    offerPrefix: string;
    defaultDueDays: string;
    lateFeePercent: string;
    defaultTerms: string;
    defaultNotes: string;
    brandingTemplates: string;
    defaultLayout: string;
    accentColor: string;
    typography: string;
    tableStyle: string;
    brevoSettings: string;
    saveAll: string;
    resetDemo: string;
    resetConfirm: string;
    savedNotification: string;
    langChangedNotification: string;
  };
  templates: {
    invoiceTitle: string;
    offerTitle: string;
    billTo: string;
    date: string;
    dueDate: string;
    validUntil: string;
    itemCol: string;
    qtyCol: string;
    priceCol: string;
    taxCol: string;
    totalCol: string;
    subtotalLabel: string;
    taxLabel: string;
    totalDueLabel: string;
    paymentInstructions: string;
    bankNameLabel: string;
    ibanLabel: string;
    bicLabel: string;
    thankYouNote: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      dashboard: 'Dashboard',
      invoices: 'Invoices',
      offers: 'Offers',
      clients: 'Clients',
      windows: 'House Window Types',
      products: 'Products & Services',
      payments: 'Payments & Revenue',
      emailHistory: 'Email History',
      settings: 'Settings',
      newInvoice: 'New Invoice',
      newOffer: 'New Offer',
      newClient: 'New Client',
      recordPayment: 'Record Payment',
      collapse: 'Collapse Sidebar',
      expand: 'Expand Sidebar',
      quickAction: 'Quick Action',
      stylesCount: '30 Styles',
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      add: 'Add',
      back: 'Back',
      view: 'View',
      download: 'Download',
      print: 'Print',
      send: 'Send',
      resend: 'Resend',
      search: 'Search...',
      filter: 'Filter',
      all: 'All',
      status: 'Status',
      actions: 'Actions',
      details: 'Details',
      close: 'Close',
      loading: 'Loading...',
      success: 'Success',
      error: 'Error',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      exportCsv: 'Export CSV',
      importCsv: 'Import CSV',
      reset: 'Reset',
      copy: 'Copy',
      copied: 'Copied!',
      preview: 'Preview',
      duplicate: 'Duplicate',
      select: 'Select',
      refresh: 'Refresh',
      total: 'Total',
      subtotal: 'Subtotal',
      vat: 'VAT',
      tax: 'Tax',
      discount: 'Discount',
      notes: 'Notes',
      terms: 'Terms & Conditions',
      date: 'Date',
      dueDate: 'Due Date',
      issueDate: 'Issue Date',
      client: 'Client',
      amount: 'Amount',
      paid: 'Paid',
      unpaid: 'Unpaid',
      overdue: 'Overdue',
      draft: 'Draft',
      sent: 'Sent',
      cancelled: 'Cancelled',
      accepted: 'Accepted',
      rejected: 'Rejected',
      expired: 'Expired',
      pending: 'Pending',
      delivered: 'Delivered',
      failed: 'Failed',
      item: 'Item',
      description: 'Description',
      quantity: 'Qty',
      unitPrice: 'Unit Price',
      unit: 'Unit',
      piece: 'pcs',
      hour: 'hrs',
      sqm: 'm²',
      meter: 'm',
      set: 'set',
      language: 'Language',
      english: 'English',
      german: 'German (Deutsch)',
      selectLanguage: 'Select Language',
      optional: 'Optional',
      required: 'Required',
    },
    status: {
      paid: 'Paid',
      unpaid: 'Unpaid',
      overdue: 'Overdue',
      draft: 'Draft',
      sent: 'Sent',
      cancelled: 'Cancelled',
      accepted: 'Accepted',
      rejected: 'Rejected',
      expired: 'Expired',
      pending: 'Pending',
      delivered: 'Delivered',
      failed: 'Failed',
    },
    dashboard: {
      title: 'Enterprise Dashboard',
      subtitle: 'Real-time overview of invoices, window estimations, revenue, and client operations',
      totalRevenue: 'Total Paid Revenue',
      outstandingRevenue: 'Outstanding / Pending',
      paidInvoices: 'Paid Invoices',
      pendingOffers: 'Pending Quotations',
      overdueAlert: 'Overdue Invoices Alert',
      recentInvoices: 'Recent Invoices',
      recentOffers: 'Recent Window Quotations',
      quickStats: 'Operational Health',
      monthlyRevenue: 'Revenue Trend',
      quickShortcuts: 'Quick Shortcuts',
      viewAllInvoices: 'View All Invoices',
      viewAllOffers: 'View All Offers',
      collectionRate: 'Collection Rate',
      averageInvoice: 'Average Invoice Value',
      activeClients: 'Active Clients',
      catalogItems: 'Window & Hardware Styles',
      noRecentInvoices: 'No invoices created yet.',
      noRecentOffers: 'No quotations created yet.',
      overdueInvoicesWarning: 'Action Required: You have overdue invoices pending settlement.',
      resolvedStatus: 'All invoice accounts in good standing',
    },
    invoices: {
      title: 'Invoices & Billing',
      subtitle: 'Manage, issue, print, PDF export and dispatch enterprise invoices directly via Brevo',
      newInvoice: 'Create Invoice',
      editInvoice: 'Edit Invoice',
      invoiceNumber: 'Invoice Number',
      invoiceDate: 'Issue Date',
      paymentDueDate: 'Payment Due Date',
      billTo: 'Bill To (Client)',
      selectClient: 'Select or Search Client',
      addClientQuick: '+ Quick Add Client',
      lineItems: 'Invoice Line Items',
      addLineItem: 'Add Item',
      addWindowPreset: '+ Add Window from 30 Types Catalog',
      subtotal: 'Net Subtotal',
      vatTax: 'VAT / Sales Tax',
      totalAmount: 'Total Due',
      paymentStatus: 'Payment Status',
      paymentMethod: 'Payment Method',
      paymentTerms: 'Payment Terms & Conditions',
      bankDetails: 'Bank Coordinates',
      invoiceNotes: 'Client Notes & Memo',
      footerNotes: 'Legal & Company Footer',
      markPaid: 'Mark as Paid',
      markUnpaid: 'Mark as Unpaid',
      sendByEmail: 'Send via Brevo',
      downloadPdf: 'Download PDF',
      printDoc: 'Print Invoice',
      duplicateInvoice: 'Duplicate Invoice',
      deleteConfirm: 'Are you sure you want to delete this invoice?',
      emptyList: 'No invoices found matching your filter criteria.',
      filterAll: 'All Invoices',
      filterPaid: 'Paid',
      filterUnpaid: 'Unpaid',
      filterOverdue: 'Overdue',
      filterDraft: 'Drafts',
      itemsCount: 'items',
      invoiceCreated: 'Invoice created successfully!',
      invoiceUpdated: 'Invoice updated successfully!',
      invoiceDeleted: 'Invoice deleted.',
      recordPayment: 'Record Payment',
      templateStyle: 'Template Style',
      colorTheme: 'Color Accent',
      backToList: 'Back to Invoices',
      metrics: {
        totalInvoiced: 'Total Invoiced',
        collected: 'Collected',
        outstanding: 'Outstanding',
        overdue: 'Overdue',
      },
      searchPlaceholder: 'Search invoices by number, client, or email...',
      client: 'Client',
      date: 'Date',
      dueDate: 'Due Date',
      amount: 'Amount',
      status: 'Status',
      noInvoices: 'No invoices found',
      sendEmail: 'Send via Email',
      items: 'Line Items',
    },
    offers: {
      title: 'Offers',
      subtitle: 'Configure custom architectural windows, calculate offers, and convert directly into invoices',
      newOffer: 'Create New Offer',
      editOffer: 'Edit Offer',
      offerNumber: 'Offer Number',
      offerDate: 'Offer Date',
      validUntil: 'Valid Until',
      client: 'Client / Recipient',
      scopeOfWork: 'Offer Items & Window Specifications',
      addLineItem: 'Add Item',
      addWindowPreset: '+ Add Window Specification',
      totalEstimated: 'Total Offer Value (incl. VAT)',
      convertToInvoice: 'Convert to Invoice',
      convertConfirm: 'Convert this offer into an active invoice? Items, client, and totals will be preserved.',
      offerAccepted: 'Offer Accepted',
      offerRejected: 'Offer Rejected',
      markAccepted: 'Mark as Accepted',
      markRejected: 'Mark as Rejected',
      sendOfferEmail: 'Send Offer via Brevo',
      downloadOfferPdf: 'Download Offer PDF',
      statusDraft: 'Draft',
      statusSent: 'Sent to Client',
      statusAccepted: 'Accepted',
      statusRejected: 'Declined',
      statusExpired: 'Expired',
      emptyList: 'No offers found.',
      createdSuccess: 'Offer created successfully!',
      convertedSuccess: 'Offer successfully converted to Invoice!',
    },
    windows: {
      title: 'House Window Types & Engineering Catalog',
      subtitle: '30 complete window configurations with technical specs, thermal insulation (U-value), soundproofing & direct estimation',
      totalStyles: '30 Window Styles Available',
      searchPlaceholder: 'Search window styles, materials, glazing, opening type...',
      filterAll: 'All Styles (30)',
      filterModern: 'Modern & High-Performance',
      filterClassic: 'Classic & Heritage',
      filterPanorama: 'Panorama & Large Openings',
      filterRoof: 'Roof & Skylights',
      filterSpecial: 'Architectural & Special Shapes',
      techSpecs: 'Technical Specifications',
      uValue: 'Thermal Insulation (U-Value)',
      thermalInsulation: 'Heat Insulation',
      soundInsulation: 'Acoustic Rating (dB)',
      frameDepth: 'Frame Depth (Bautiefe)',
      glazing: 'Glazing System',
      securityClass: 'Security Rating',
      openingType: 'Opening Mechanism',
      material: 'Frame Material',
      basePrice: 'Starting Base Price',
      dimensions: 'Standard Dimensions',
      width: 'Width (mm)',
      height: 'Height (mm)',
      configureWindow: 'Configure & Estimate',
      addToOffer: 'Add to Quotation',
      addToInvoice: 'Add to Invoice',
      customNotes: 'Custom Window Notes / Glass Coating',
      glassType: 'Glass Option',
      frameColor: 'Frame Color / Finish',
      white: 'Standard Pure White',
      anthracite: 'Anthracite Grey (RAL 7016)',
      goldenOak: 'Golden Oak Woodgrain',
      mahogany: 'Mahogany Woodgrain',
      doubleGlazed: 'Double Glazing (2-fach)',
      tripleGlazed: 'Triple Glazing (3-fach Ug=0.5)',
      quadGlazed: 'Quadruple Passive House Glazing',
      tiltTurn: 'Tilt & Turn (Dreh-Kipp)',
      casement: 'Side-Hung Casement',
      sliding: 'Lift & Slide / Parallel',
      fixed: 'Fixed Architectural Pane',
      awning: 'Top-Hung Awning',
      hopper: 'Bottom-Hung Hopper',
      pivot: 'Center Pivot',
      bay: 'Multi-angle Bay Window',
      skylight: 'Roof Skylight with Rain Sensor',
      french: 'French Double Casement (Stulp)',
      arch: 'Arched Roundtop Window',
      addedToInvoice: 'Window added to invoice items!',
      addedToOffer: 'Window added to quotation items!',
      calculator: 'Dimension & Option Price Multiplier',
      features: 'Key Engineering Features',
      recommendedUse: 'Recommended Applications',
    },
    clients: {
      title: 'Client Directory',
      subtitle: 'Manage client relationships, billing details, VAT numbers, and transactional history',
      newClient: 'Add New Client',
      editClient: 'Edit Client',
      clientName: 'Contact Person / Client Name',
      companyName: 'Company Name',
      email: 'Email Address',
      phone: 'Phone Number',
      address: 'Street Address',
      city: 'City',
      country: 'Country',
      postalCode: 'Postal / ZIP Code',
      vatNumber: 'VAT / Tax ID Number',
      businessNumber: 'Commercial Reg. Number',
      totalInvoiced: 'Total Invoiced',
      outstandingBalance: 'Outstanding Balance',
      clientHistory: 'Document History',
      noClients: 'No clients registered in the system.',
      deleteConfirm: 'Are you sure you want to delete this client?',
      importSuccess: 'Clients imported successfully!',
      clientSaved: 'Client details saved.',
      searchPlaceholder: 'Search clients by name, company, email, or city...',
      clientDetails: 'Client Information',
    },
    products: {
      title: 'Products & Services Catalog',
      subtitle: 'Manage standard inventory items, window hardware, installation labor rates, and glass units',
      newProduct: 'Add Product / Service',
      editProduct: 'Edit Item',
      sku: 'SKU / Code',
      name: 'Product / Service Name',
      category: 'Category',
      price: 'Unit Price',
      unit: 'Unit of Measure',
      stock: 'Stock / Availability',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      vatRate: 'VAT Rate (%)',
      description: 'Item Description',
      noProducts: 'No products in catalog.',
      deleteConfirm: 'Are you sure you want to delete this product?',
      productSaved: 'Product saved successfully.',
      searchPlaceholder: 'Search products by name, SKU, or category...',
      catWindows: 'Windows & Profiles',
      catGlass: 'Glass & Glazing',
      catHardware: 'Fittings & Hardware',
      catLabor: 'Installation & Labor',
      catAccessories: 'Accessories & Sills',
    },
    payments: {
      title: 'Payments & Revenue Ledger',
      subtitle: 'Track incoming payments, reconcile invoices, and review financial liquidity',
      recordPayment: 'Record Incoming Payment',
      paymentLedger: 'Payment Transaction History',
      invoiceRef: 'Invoice Reference',
      paymentDate: 'Payment Date',
      method: 'Payment Method',
      amountReceived: 'Amount Received',
      notes: 'Payment Notes / Bank Reference',
      paymentRecorded: 'Payment recorded successfully!',
      methodBankTransfer: 'Bank Transfer (SEPA / Wire)',
      methodCreditCard: 'Credit Card',
      methodPayPal: 'PayPal',
      methodCash: 'Cash Payment',
      methodDirectDebit: 'Direct Debit / ACH',
      totalCollected: 'Total Collected',
      pendingCollection: 'Pending Settlement',
      noPayments: 'No payment transactions recorded yet.',
      selectInvoice: 'Select Invoice to Settle',
    },
    email: {
      title: 'Email History & Brevo Logs',
      subtitle: 'Monitor transactional email dispatches, delivery statuses, and resend invoices with one click',
      brevoTitle: 'Brevo (Sendinblue) Transactional SMTP',
      brevoSubtitle: 'High-deliverability enterprise email service for invoices, quotes, and payment notices',
      brevoConnected: 'Brevo API Connected',
      noApiKey: 'Simulation Mode (No Key Set)',
      emailLogs: 'Email Dispatch Audit Logs',
      recipient: 'Recipient',
      subject: 'Subject Line',
      sentAt: 'Sent Timestamp',
      document: 'Document',
      status: 'Delivery Status',
      inspectMessage: 'Inspect & Preview HTML',
      resend: 'Resend via Brevo',
      clearLogs: 'Clear History',
      testEmail: 'Live Test Message',
      sendTest: 'Send Test Email',
      testingKey: 'Verifying...',
      keyValid: 'API Key Verified & Active',
      keyInvalid: 'Invalid API Key',
      verifyKey: 'Verify Brevo Key',
      senderName: 'Sender Display Name',
      senderEmail: 'Sender Email Address',
      replyTo: 'Reply-To Email Address',
      composeEmail: 'Compose Document Email',
      sendViaBrevo: 'Send via Brevo SMTP',
      emailSuccess: 'Email dispatched successfully!',
      emailFailed: 'Email dispatch failed.',
      htmlPreview: 'Rendered HTML Preview',
      textPreview: 'Plain Text Body',
      headersInfo: 'Transmission Headers & Delivery Info',
      noLogs: 'No email logs recorded yet.',
      searchPlaceholder: 'Search email logs by recipient, subject, or document...',
      filterType: 'Filter by Document Type',
    },
    settings: {
      title: 'Business Profile & Settings',
      subtitle: 'Configure enterprise branding, tax IDs, banking coordinates, language localization, and Brevo email',
      saveSettings: 'Save Settings',
      vatRate: 'VAT Rate',
      logoPosition: 'Logo Alignment',
      defaultPaymentInstructions: 'Default Payment Instructions',
      tabs: {
        company: 'Company Profile',
        banking: 'Bank Account',
        invoicing: 'Invoicing Defaults',
        branding: 'Branding & Design',
        email: 'Email & Brevo',
        language: 'Language & Region',
      },
      sections: {
        businessIdentity: 'Business Identity & Legal Entity',
        bankingDetails: 'Bank & Tax Information',
        invoiceDefaults: 'Default Invoice & Quote Settings',
        brandingDesign: 'Branding, Layout & Colors',
        brevoIntegration: 'Brevo (Sendinblue) Integration',
        languageLocalization: 'Language & Localization',
      },
      fields: {
        businessName: 'Business / Company Name',
        signatoryName: 'Authorized Signatory Name',
        businessEmail: 'Official Business Email',
        phone: 'Phone Number',
        website: 'Company Website',
        address: 'Street Address',
        city: 'City',
        postalCode: 'Postal / ZIP Code',
        country: 'Country',
        bankName: 'Bank Name',
        accountHolder: 'Account Holder Name',
        iban: 'IBAN Number',
        swift: 'BIC / SWIFT Code',
        vatNumber: 'VAT Registration ID',
        registrationNumber: 'Commercial Registration No.',
        defaultCurrency: 'Default Currency',
        defaultVatRate: 'Default VAT Rate (%)',
        invoicePrefix: 'Invoice Prefix',
        offerPrefix: 'Quotation Prefix',
        defaultDueDays: 'Default Due Period (Days)',
        latePaymentFee: 'Late Payment Fee (%)',
        paymentTerms: 'Default Payment Terms',
        invoiceTemplate: 'Invoice Template',
        brandColor: 'Brand Primary Color',
        fontFamily: 'Typography Font',
        tableStyle: 'Table Styling',
        brevoApiKey: 'Brevo API Key',
        senderName: 'Sender Name',
        senderEmail: 'Sender Email Address',
        replyTo: 'Reply-To Email',
      },
      tabProfile: 'Company Information',
      tabBanking: 'Bank & Tax Details',
      tabInvoicing: 'Invoice Defaults',
      tabDesign: 'Branding & Templates',
      tabEmail: 'Brevo & Email',
      tabLanguage: 'Language & Localization',
      languageTitle: 'Application Language (Sprache)',
      languageDesc: 'Select your preferred language for the interface, invoice documents, window specifications, and email dispatches.',
      selectAppLanguage: 'Interface & Document Language',
      enLabel: 'English (US / International)',
      enDesc: 'Default global interface with standard currency formatting and international terminology.',
      deLabel: 'German (Deutsch - DE / AT / CH)',
      deDesc: 'Vollständige deutsche Übersetzung für Benutzeroberfläche, Rechnungen, Angebote, Fenstertypen und Brevo-E-Mails.',
      businessIdentity: 'Business Identity & Contacts',
      businessName: 'Business Name',
      ownerName: 'Owner / Signatory Name',
      businessEmail: 'Business Email',
      phone: 'Phone Number',
      website: 'Website URL',
      streetAddress: 'Street Address',
      city: 'City',
      postalCode: 'Postal / ZIP Code',
      country: 'Country',
      bankCoordinates: 'Bank Coordinates & Tax Identifiers',
      bankName: 'Bank Name',
      accountHolder: 'Account Holder Name',
      iban: 'IBAN / Account Number',
      swiftBic: 'BIC / SWIFT Code',
      vatId: 'VAT / Tax ID Number',
      regNumber: 'Commercial Registration Number',
      invoiceDefaults: 'Document Numbering & Defaults',
      defaultCurrency: 'Default Currency',
      defaultVat: 'Default VAT Rate (%)',
      invoicePrefix: 'Invoice Prefix',
      offerPrefix: 'Quotation Prefix',
      defaultDueDays: 'Default Due Days',
      lateFeePercent: 'Late Payment Fee (% / month)',
      defaultTerms: 'Default Payment Terms & Notes',
      defaultNotes: 'Default Invoice Notes',
      brandingTemplates: 'Default Template & Color Styles',
      defaultLayout: 'Default Template Layout',
      accentColor: 'Default Accent Brand Color',
      typography: 'Default Typography',
      tableStyle: 'Table Border Style',
      brevoSettings: 'Brevo (Sendinblue) Transactional SMTP',
      saveAll: 'Save All Settings',
      resetDemo: 'Reset Demo Data',
      resetConfirm: 'Are you sure you want to reset all data back to clean sample data?',
      savedNotification: 'All settings and localization saved successfully!',
      langChangedNotification: 'Language changed successfully!',
    },
    templates: {
      invoiceTitle: 'INVOICE',
      offerTitle: 'QUOTATION / OFFER',
      billTo: 'BILL TO',
      date: 'Date',
      dueDate: 'Due Date',
      validUntil: 'Valid Until',
      itemCol: 'Item & Description',
      qtyCol: 'Qty',
      priceCol: 'Unit Price',
      taxCol: 'Tax',
      totalCol: 'Amount',
      subtotalLabel: 'Net Subtotal',
      taxLabel: 'VAT / Sales Tax',
      totalDueLabel: 'Total Due',
      paymentInstructions: 'Payment Instructions',
      bankNameLabel: 'Bank',
      ibanLabel: 'IBAN',
      bicLabel: 'BIC / SWIFT',
      thankYouNote: 'Thank you for your business!',
    },
  },
  de: {
    nav: {
      dashboard: 'Übersicht / Dashboard',
      invoices: 'Rechnungen',
      offers: 'Angebote',
      clients: 'Kunden',
      windows: 'Fenstertypen-Katalog',
      products: 'Produkte & Leistungen',
      payments: 'Zahlungen & Einnahmen',
      emailHistory: 'E-Mail-Verlauf & Brevo',
      settings: 'Einstellungen',
      newInvoice: 'Neue Rechnung',
      newOffer: 'Neues Angebot',
      newClient: 'Neuer Kunde',
      recordPayment: 'Zahlung erfassen',
      collapse: 'Seitenleiste einklappen',
      expand: 'Seitenleiste ausklappen',
      quickAction: 'Schnellaktion',
      stylesCount: '30 Stile',
    },
    common: {
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      create: 'Erstellen',
      add: 'Hinzufügen',
      back: 'Zurück',
      view: 'Anzeigen',
      download: 'Herunterladen',
      print: 'Drucken',
      send: 'Senden',
      resend: 'Erneut senden',
      search: 'Suchen...',
      filter: 'Filter',
      all: 'Alle',
      status: 'Status',
      actions: 'Aktionen',
      details: 'Details',
      close: 'Schließen',
      loading: 'Wird geladen...',
      success: 'Erfolgreich',
      error: 'Fehler',
      confirm: 'Bestätigen',
      yes: 'Ja',
      no: 'Nein',
      exportCsv: 'CSV exportieren',
      importCsv: 'CSV importieren',
      reset: 'Zurücksetzen',
      copy: 'Kopieren',
      copied: 'Kopiert!',
      preview: 'Vorschau',
      duplicate: 'Duplizieren',
      select: 'Auswählen',
      refresh: 'Aktualisieren',
      total: 'Gesamtbetrag',
      subtotal: 'Zwischensumme',
      vat: 'MwSt.',
      tax: 'Steuer',
      discount: 'Rabatt',
      notes: 'Hinweise & Anmerkungen',
      terms: 'Zahlungs- & Lieferbedingungen',
      date: 'Datum',
      dueDate: 'Fälligkeitsdatum',
      issueDate: 'Rechnungsdatum',
      client: 'Kunde / Empfänger',
      amount: 'Betrag',
      paid: 'Bezahlt',
      unpaid: 'Offen',
      overdue: 'Überfällig',
      draft: 'Entwurf',
      sent: 'Versendet',
      cancelled: 'Storniert',
      accepted: 'Angenommen',
      rejected: 'Abgelehnt',
      expired: 'Abgelaufen',
      pending: 'Ausstehend',
      delivered: 'Zugestellt',
      failed: 'Fehlgeschlagen',
      item: 'Position',
      description: 'Beschreibung',
      quantity: 'Menge',
      unitPrice: 'Einzelpreis',
      unit: 'Einheit',
      piece: 'Stk.',
      hour: 'Std.',
      sqm: 'm²',
      meter: 'm',
      set: 'Set',
      language: 'Sprache',
      english: 'Englisch (English)',
      german: 'Deutsch',
      selectLanguage: 'Sprache auswählen',
      optional: 'Optional',
      required: 'Erforderlich',
    },
    status: {
      paid: 'Bezahlt',
      unpaid: 'Offen',
      overdue: 'Überfällig',
      draft: 'Entwurf',
      sent: 'Gesendet',
      cancelled: 'Storniert',
      accepted: 'Angenommen',
      rejected: 'Abgelehnt',
      expired: 'Abgelaufen',
      pending: 'Ausstehend',
      delivered: 'Zugestellt',
      failed: 'Fehlgeschlagen',
    },
    dashboard: {
      title: 'Unternehmens-Dashboard',
      subtitle: 'Echtzeit-Übersicht über Rechnungen, Fensterangebote, Einnahmen und Kundenverwaltung',
      totalRevenue: 'Einnahmen (Bezahlt)',
      outstandingRevenue: 'Offene Forderungen',
      paidInvoices: 'Bezahlte Rechnungen',
      pendingOffers: 'Ausstehende Angebote',
      overdueAlert: 'Überfällige Rechnungen',
      recentInvoices: 'Neueste Rechnungen',
      recentOffers: 'Neueste Fenster-Angebote',
      quickStats: 'Finanz- & Geschäftsstatus',
      monthlyRevenue: 'Umsatzentwicklung',
      quickShortcuts: 'Schnellzugriff',
      viewAllInvoices: 'Alle Rechnungen anzeigen',
      viewAllOffers: 'Alle Angebote anzeigen',
      collectionRate: 'Zahlungsquote',
      averageInvoice: 'Durchschnittlicher Rechnungswert',
      activeClients: 'Aktive Kunden',
      catalogItems: 'Fenster- & Beschlagtypen',
      noRecentInvoices: 'Noch keine Rechnungen erstellt.',
      noRecentOffers: 'Noch keine Angebote erstellt.',
      overdueInvoicesWarning: 'Handlungsbedarf: Sie haben überfällige Rechnungen mit ausstehendem Zahlungseingang.',
      resolvedStatus: 'Alle Rechnungen sind fristgerecht bezahlt',
    },
    invoices: {
      title: 'Rechnungsverwaltung & Fakturierung',
      subtitle: 'Rechnungen erstellen, verwalten, drucken, als PDF exportieren und direkt via Brevo versenden',
      newInvoice: 'Rechnung erstellen',
      editInvoice: 'Rechnung bearbeiten',
      invoiceNumber: 'Rechnungsnummer',
      invoiceDate: 'Rechnungsdatum',
      paymentDueDate: 'Zahlungsziel / Fälligkeit',
      billTo: 'Rechnungsempfänger (Kunde)',
      selectClient: 'Kunde auswählen oder suchen',
      addClientQuick: '+ Schnellanlage Kunde',
      lineItems: 'Rechnungspositionen',
      addLineItem: 'Position hinzufügen',
      addWindowPreset: '+ Fenster aus 30-Typen-Katalog einfügen',
      subtotal: 'Nettobetrag (Zwischensumme)',
      vatTax: 'Umsatzsteuer / MwSt.',
      totalAmount: 'Gesamtbetrag (Brutto)',
      paymentStatus: 'Zahlungsstatus',
      paymentMethod: 'Zahlungsart',
      paymentTerms: 'Zahlungsbedingungen & Fristen',
      bankDetails: 'Bankverbindung & Überweisungsdaten',
      invoiceNotes: 'Kundenhinweise & Verwendungszweck',
      footerNotes: 'Rechtliche Angaben & Fußzeile',
      markPaid: 'Als bezahlt markieren',
      markUnpaid: 'Als offen markieren',
      sendByEmail: 'Per Brevo E-Mail senden',
      downloadPdf: 'PDF herunterladen',
      printDoc: 'Rechnung drucken',
      duplicateInvoice: 'Rechnung duplizieren',
      deleteConfirm: 'Möchten Sie diese Rechnung wirklich unwiderruflich löschen?',
      emptyList: 'Keine Rechnungen für den gewählten Filter gefunden.',
      filterAll: 'Alle Rechnungen',
      filterPaid: 'Bezahlt',
      filterUnpaid: 'Offen',
      filterOverdue: 'Überfällig',
      filterDraft: 'Entwürfe',
      itemsCount: 'Positionen',
      invoiceCreated: 'Rechnung erfolgreich erstellt!',
      invoiceUpdated: 'Rechnung erfolgreich aktualisiert!',
      invoiceDeleted: 'Rechnung gelöscht.',
      recordPayment: 'Zahlung erfassen',
      templateStyle: 'Rechnungsvorlage',
      colorTheme: 'Akzentfarbe',
      backToList: 'Zurück zur Rechnungsliste',
      metrics: {
        totalInvoiced: 'Gesamt Fakturiert',
        collected: 'Erhalten / Bezahlt',
        outstanding: 'Ausstehend',
        overdue: 'Überfällig',
      },
      searchPlaceholder: 'Rechnungen nach Nummer, Kunde oder E-Mail suchen...',
      client: 'Kunde',
      date: 'Datum',
      dueDate: 'Fälligkeitsdatum',
      amount: 'Betrag',
      status: 'Status',
      noInvoices: 'Keine Rechnungen gefunden',
      sendEmail: 'Per E-Mail senden',
      items: 'Positionen',
    },
    offers: {
      title: 'Angebote',
      subtitle: 'Individuelle Fenster konfigurieren, Angebote kalkulieren und mit einem Klick in Rechnungen umwandeln',
      newOffer: 'Neues Angebot erstellen',
      editOffer: 'Angebot bearbeiten',
      offerNumber: 'Angebotsnummer',
      offerDate: 'Angebotsdatum',
      validUntil: 'Gültig bis',
      client: 'Kunde / Empfänger',
      scopeOfWork: 'Angebotspositionen & Fensterspezifikationen',
      addLineItem: 'Position hinzufügen',
      addWindowPreset: '+ Fensterspezifikation einfügen',
      totalEstimated: 'Gesamtsumme Angebot',
      convertToInvoice: 'In Rechnung umwandeln',
      convertConfirm: 'Dieses Angebot in eine aktive Rechnung umwandeln? Alle Positionen, Kundendaten und Beträge werden übernommen.',
      offerAccepted: 'Angebot angenommen',
      offerRejected: 'Angebot abgelehnt',
      markAccepted: 'Als angenommen markieren',
      markRejected: 'Als abgelehnt markieren',
      sendOfferEmail: 'Angebot per Brevo senden',
      downloadOfferPdf: 'Angebot als PDF herunterladen',
      statusDraft: 'Entwurf',
      statusSent: 'An Kunden gesendet',
      statusAccepted: 'Angenommen',
      statusRejected: 'Abgelehnt',
      statusExpired: 'Abgelaufen',
      emptyList: 'Keine Angebote vorhanden.',
      createdSuccess: 'Angebot erfolgreich erstellt!',
      convertedSuccess: 'Angebot erfolgreich in Rechnung umgewandelt!',
    },
    windows: {
      title: 'Fenstertypen & Technischer Katalog',
      subtitle: '30 vollständige Fensterkonstruktionen mit U-Werten, Schallschutzklassen, Bautiefen & Direktübernahme in Angebote',
      totalStyles: '30 Fenstertypen verfügbar',
      searchPlaceholder: 'Fenstertyp, Material, Verglasung oder Öffnungsart suchen...',
      filterAll: 'Alle 30 Stile',
      filterModern: 'Moderne Hochleistungsfenster',
      filterClassic: 'Klassische & historische Fenster',
      filterPanorama: 'Panorama- & Schiebesysteme',
      filterRoof: 'Dachfenster & Lichtkuppeln',
      filterSpecial: 'Architektur- & Sonderformen',
      techSpecs: 'Technische Leistungsdaten',
      uValue: 'Wärmedämmwert (U-Wert)',
      thermalInsulation: 'Wärmedämmung',
      soundInsulation: 'Schallschutzmaß (dB)',
      frameDepth: 'Bautiefe / Profiltiefe',
      glazing: 'Verglasungsart',
      securityClass: 'Widerstandsklasse (RC)',
      openingType: 'Öffnungsmechanismus',
      material: 'Rahmenmaterial',
      basePrice: 'Richtpreis ab Werk',
      dimensions: 'Standardmaße (B x H)',
      width: 'Breite (mm)',
      height: 'Höhe (mm)',
      configureWindow: 'Konfigurieren & Kalkulieren',
      addToOffer: 'Zum Angebot hinzufügen',
      addToInvoice: 'Zur Rechnung hinzufügen',
      customNotes: 'Sonderausstattung / Beschichtung',
      glassType: 'Glasoption',
      frameColor: 'Rahmenfarbe / Dekor',
      white: 'Verkehrsweiß (RAL 9016)',
      anthracite: 'Anthrazitgrau (RAL 7016)',
      goldenOak: 'Golden Oak Holzdekor',
      mahogany: 'Mahagoni Holzdekor',
      doubleGlazed: '2-fach Wärmeschutzglas (Ug 1.1)',
      tripleGlazed: '3-fach Isolierglas (Ug 0.5)',
      quadGlazed: '4-fach Passivhaus-Verglasung',
      tiltTurn: 'Dreh-Kipp-Flügel',
      casement: 'Drehflügel',
      sliding: 'Hebe-Schiebe-Anlage',
      fixed: 'Festverglasung',
      awning: 'Klappflügel / Oberlicht',
      hopper: 'Kippflügel',
      pivot: 'Schwingflügel',
      bay: 'Erkerfenster-Kombination',
      skylight: 'Dachflächenfenster mit Regensensor',
      french: 'Französisches Doppelflügelfenster (Stulp)',
      arch: 'Rundbogenfenster',
      addedToInvoice: 'Fenster zu Rechnungspositionen hinzugefügt!',
      addedToOffer: 'Fenster zu Angebotspositionen hinzugefügt!',
      calculator: 'Maß- & Aufpreis-Kalkulator',
      features: 'Konstruktionsmerkmale',
      recommendedUse: 'Empfohlener Einsatzbereich',
    },
    clients: {
      title: 'Kundenkartei & Kontakte',
      subtitle: 'Kundenbeziehungen, Rechnungsanschriften, USt-IdNr. und bisherige Dokumentenhistorie verwalten',
      newClient: 'Neuen Kunden anlegen',
      editClient: 'Kunde bearbeiten',
      clientName: 'Ansprechpartner / Kundenname',
      companyName: 'Firmenname',
      email: 'E-Mail-Adresse',
      phone: 'Telefonnummer',
      address: 'Straße und Hausnummer',
      city: 'Stadt / Ort',
      country: 'Land',
      postalCode: 'Postleitzahl (PLZ)',
      vatNumber: 'Umsatzsteuer-ID (USt-IdNr.)',
      businessNumber: 'Handelsregisternummer',
      totalInvoiced: 'Gesamtumsatz',
      outstandingBalance: 'Offener Rechnungsbetrag',
      clientHistory: 'Dokumentenhistorie',
      noClients: 'Noch keine Kunden angelegt.',
      deleteConfirm: 'Möchten Sie diesen Kunden wirklich löschen?',
      importSuccess: 'Kunden erfolgreich importiert!',
      clientSaved: 'Kundendaten gespeichert.',
      searchPlaceholder: 'Kunden nach Name, Firma, E-Mail oder Stadt durchsuchen...',
      clientDetails: 'Kundenstammdaten',
    },
    products: {
      title: 'Produkte & Leistungsverzeichnis',
      subtitle: 'Standardartikel, Fensterprofile, Beschläge, Montageleistungen und Glaseinheiten verwalten',
      newProduct: 'Produkt / Leistung anlegen',
      editProduct: 'Artikel bearbeiten',
      sku: 'Artikelnummer / SKU',
      name: 'Bezeichnung / Leistung',
      category: 'Kategorie',
      price: 'Einzelpreis (Netto)',
      unit: 'Einheit',
      stock: 'Lagerbestand / Verfügbarkeit',
      inStock: 'Auf Lager',
      outOfStock: 'Nicht verfügbar',
      vatRate: 'MwSt.-Satz (%)',
      description: 'Artikelbeschreibung',
      noProducts: 'Keine Produkte im Verzeichnis vorhanden.',
      deleteConfirm: 'Möchten Sie dieses Produkt wirklich löschen?',
      productSaved: 'Produkt erfolgreich gespeichert.',
      searchPlaceholder: 'Artikel nach Bezeichnung, SKU oder Kategorie durchsuchen...',
      catWindows: 'Fenster & Profile',
      catGlass: 'Glas & Scheiben',
      catHardware: 'Beschläge & Griffe',
      catLabor: 'Montage & Einbau',
      catAccessories: 'Zubehör & Fensterbänke',
    },
    payments: {
      title: 'Zahlungseingänge & Finanzjournal',
      subtitle: 'Zahlungseingänge erfassen, Rechnungen ausgleichen und Liquidität in Echtzeit überwachen',
      recordPayment: 'Zahlungseingang buchen',
      paymentLedger: 'Buchungsjournal aller Zahlungseingänge',
      invoiceRef: 'Rechnungsreferenz',
      paymentDate: 'Zahlungsdatum',
      method: 'Zahlungsart',
      amountReceived: 'Erhaltener Betrag',
      notes: 'Buchungstext / Verwendungszweck',
      paymentRecorded: 'Zahlungseingang erfolgreich verbucht!',
      methodBankTransfer: 'Banküberweisung (SEPA)',
      methodCreditCard: 'Kreditkarte',
      methodPayPal: 'PayPal',
      methodCash: 'Barzahlung',
      methodDirectDebit: 'Lastschrift / Bankeinzug',
      totalCollected: 'Gesamteinnahmen',
      pendingCollection: 'Ausstehende Zahlungen',
      noPayments: 'Noch keine Zahlungseingänge verbucht.',
      selectInvoice: 'Rechnung für Buchung auswählen',
    },
    email: {
      title: 'E-Mail-Verlauf & Brevo-Protokolle',
      subtitle: 'Transaktions-E-Mails überwachen, Zustellungsstatus prüfen und Rechnungen mit einem Klick erneut versenden',
      brevoTitle: 'Brevo (Sendinblue) Transaktions-SMTP',
      brevoSubtitle: 'Höchste Zustellungsrate für Rechnungen, Angebote und Zahlungserinnerungen',
      brevoConnected: 'Brevo API verbunden & aktiv',
      noApiKey: 'Simulationsmodus (Kein API-Schlüssel hinterlegt)',
      emailLogs: 'E-Mail-Versandprotokolle',
      recipient: 'Empfänger',
      subject: 'Betreffzeile',
      sentAt: 'Sendezeitpunkt',
      document: 'Dokument',
      status: 'Zustellstatus',
      inspectMessage: 'HTML-Vorschau & Details prüfen',
      resend: 'Über Brevo erneut senden',
      clearLogs: 'Verlauf leeren',
      testEmail: 'Live-Testnachricht',
      sendTest: 'Test-E-Mail absenden',
      testingKey: 'Wird überprüft...',
      keyValid: 'API-Schlüssel gültig und verifiziert',
      keyInvalid: 'Ungültiger API-Schlüssel',
      verifyKey: 'Brevo-Schlüssel prüfen',
      senderName: 'Absender-Anzeigename',
      senderEmail: 'Absender-E-Mail-Adresse',
      replyTo: 'Antwortadresse (Reply-To)',
      composeEmail: 'Dokument-E-Mail verfassen',
      sendViaBrevo: 'Über Brevo SMTP versenden',
      emailSuccess: 'E-Mail erfolgreich versendet!',
      emailFailed: 'E-Mail-Versand fehlgeschlagen.',
      htmlPreview: 'Gerenderte HTML-Vorschau',
      textPreview: 'Klartext-Nachricht',
      headersInfo: 'Übertragungs-Header & Zustelldaten',
      noLogs: 'Noch keine E-Mail-Protokolle vorhanden.',
      searchPlaceholder: 'Protokolle nach Empfänger, Betreff oder Dokument durchsuchen...',
      filterType: 'Nach Dokumenttyp filtern',
    },
    settings: {
      title: 'Unternehmensprofil & Einstellungen',
      subtitle: 'Unternehmensdaten, Bank- und Steuerangaben, Sprachlokalisierung und Brevo E-Mail konfigurieren',
      saveSettings: 'Einstellungen speichern',
      vatRate: 'MwSt.-Satz',
      logoPosition: 'Logo-Ausrichtung',
      defaultPaymentInstructions: 'Standard-Zahlungshinweise',
      tabs: {
        company: 'Unternehmensprofil',
        banking: 'Bankverbindung',
        invoicing: 'Rechnungseinstellungen',
        branding: 'Branding & Design',
        email: 'E-Mail & Brevo',
        language: 'Sprache & Region',
      },
      sections: {
        businessIdentity: 'Unternehmensidentität & Firmendaten',
        bankingDetails: 'Bank- & Steuerdaten',
        invoiceDefaults: 'Standardwerte für Rechnungen & Angebote',
        brandingDesign: 'Branding, Layout & Farben',
        brevoIntegration: 'Brevo (Sendinblue) Integration',
        languageLocalization: 'Sprache & Lokalisierung',
      },
      fields: {
        businessName: 'Firmenname / Unternehmen',
        signatoryName: 'Vertretungsberechtigte Person',
        businessEmail: 'Offizielle E-Mail-Adresse',
        phone: 'Telefonnummer',
        website: 'Webseite',
        address: 'Straße & Hausnummer',
        city: 'Stadt',
        postalCode: 'Postleitzahl',
        country: 'Land',
        bankName: 'Bankname',
        accountHolder: 'Kontoinhaber',
        iban: 'IBAN-Nummer',
        swift: 'BIC / SWIFT-Code',
        vatNumber: 'USt-IdNr.',
        registrationNumber: 'Handelsregisternummer',
        defaultCurrency: 'Standardwährung',
        defaultVatRate: 'Standard MwSt.-Satz (%)',
        invoicePrefix: 'Rechnungs-Präfix',
        offerPrefix: 'Angebots-Präfix',
        defaultDueDays: 'Zahlungsziel (Tage)',
        latePaymentFee: 'Mahngebühr / Säumniszuschlag (%)',
        paymentTerms: 'Standard-Zahlungsbedingungen',
        invoiceTemplate: 'Rechnungsvorlage',
        brandColor: 'Hauptfarbe (Branding)',
        fontFamily: 'Schriftart (Typografie)',
        tableStyle: 'Tabellenstil',
        brevoApiKey: 'Brevo API-Schlüssel',
        senderName: 'Absendername',
        senderEmail: 'Absender E-Mail',
        replyTo: 'Antwort E-Mail (Reply-To)',
      },
      tabProfile: 'Unternehmensdaten',
      tabBanking: 'Bank & Steuerdaten',
      tabInvoicing: 'Rechnungs-Standards',
      tabDesign: 'Design & Vorlagen',
      tabEmail: 'Brevo & E-Mail',
      tabLanguage: 'Sprache & Lokalisierung',
      languageTitle: 'Anwendungssprache (Language)',
      languageDesc: 'Wählen Sie Ihre bevorzugte Sprache für die Benutzeroberfläche, Rechnungsdokumente, Fenstertypen und E-Mail-Benachrichtigungen.',
      selectAppLanguage: 'Oberflächen- & Dokumentsprache',
      enLabel: 'English (Englisch - US / International)',
      enDesc: 'Globale Benutzeroberfläche mit internationaler Terminologie und englischen Dokumentenvorlagen.',
      deLabel: 'Deutsch (German - DE / AT / CH)',
      deDesc: 'Vollständige deutsche Lokalisierung für Rechnungen (MwSt., Zahlungsziel, Bankverbindung), Angebote, Fenstertypen und Brevo-SMTP.',
      businessIdentity: 'Unternehmensidentität & Kontaktdaten',
      businessName: 'Firmenname / Unternehmensbezeichnung',
      ownerName: 'Inhaber / Zeichnungsberechtigter',
      businessEmail: 'Geschäftliche E-Mail',
      phone: 'Telefonnummer',
      website: 'Webseite-URL',
      streetAddress: 'Straße und Hausnummer',
      city: 'Ort / Stadt',
      postalCode: 'Postleitzahl (PLZ)',
      country: 'Land',
      bankCoordinates: 'Bankverbindung & Steueridentifikatoren',
      bankName: 'Name der Bank',
      accountHolder: 'Kontoinhaber',
      iban: 'IBAN',
      swiftBic: 'BIC / SWIFT-Code',
      vatId: 'Umsatzsteuer-ID (USt-IdNr.)',
      regNumber: 'Handelsregisternummer',
      invoiceDefaults: 'Nummernkreise & Standardwerte',
      defaultCurrency: 'Standardwährung',
      defaultVat: 'Standard-MwSt.-Satz (%)',
      invoicePrefix: 'Rechnungs-Präfix',
      offerPrefix: 'Angebots-Präfix',
      defaultDueDays: 'Standard-Zahlungsziel (Tage)',
      lateFeePercent: 'Verzugszinsen (% / Monat)',
      defaultTerms: 'Standard-Zahlungsbedingungen & Hinweise',
      defaultNotes: 'Standard-Rechnungshinweise',
      brandingTemplates: 'Layoutvorlagen & Farbschema',
      defaultLayout: 'Standard-Rechnungslayout',
      accentColor: 'Primäre Unternehmensfarbe',
      typography: 'Schriftart (Typografie)',
      tableStyle: 'Tabellenstil',
      brevoSettings: 'Brevo (Sendinblue) Transaktions-SMTP',
      saveAll: 'Alle Einstellungen speichern',
      resetDemo: 'Beispieldaten zurücksetzen',
      resetConfirm: 'Möchten Sie wirklich alle Daten auf die ursprünglichen Beispieldaten zurücksetzen?',
      savedNotification: 'Alle Einstellungen und Spracheinstellungen erfolgreich gespeichert!',
      langChangedNotification: 'Sprache erfolgreich umgestellt!',
    },
    templates: {
      invoiceTitle: 'RECHNUNG',
      offerTitle: 'ANGEBOT / KOSTENVORANSCHLAG',
      billTo: 'RECHNUNGSEMPFÄNGER',
      date: 'Datum',
      dueDate: 'Fälligkeitsdatum',
      validUntil: 'Gültig bis',
      itemCol: 'Position & Beschreibung',
      qtyCol: 'Menge',
      priceCol: 'Einzelpreis',
      taxCol: 'MwSt.',
      totalCol: 'Gesamtbetrag',
      subtotalLabel: 'Nettobetrag (Zwischensumme)',
      taxLabel: 'MwSt.',
      totalDueLabel: 'Fälliger Gesamtbetrag',
      paymentInstructions: 'Zahlungsinformationen & Bankverbindung',
      bankNameLabel: 'Kreditinstitut',
      ibanLabel: 'IBAN',
      bicLabel: 'BIC / SWIFT',
      thankYouNote: 'Vielen Dank für Ihren Auftrag und das entgegengebrachte Vertrauen!',
    },
  },
};
