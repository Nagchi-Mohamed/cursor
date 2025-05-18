import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Context for managing the application's language state.
 * @type {React.Context<{language: string, setLanguage: (lang: string) => void, t: (key: string) => string}>}
 */
const LanguageContext = createContext();

/**
 * Custom hook to access the language context.
 * @returns {Object} Language context object containing language state, setLanguage function, and t function
 * @throws {Error} If used outside of LanguageProvider
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

/**
 * Comprehensive translations object containing all UI strings
 * @type {Object}
 */
const translations = {
  en: {
    // Navigation
    nav: {
      home: 'Home',
      lessons: 'Lessons',
      practice: 'Practice',
      solver: 'Solver',
      forum: 'Forum',
      groupStudy: 'Group Study',
      calendar: 'Calendar',
      profile: 'Profile',
      settings: 'Settings',
    },
    // Common actions
    actions: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      view: 'View',
      reply: 'Reply',
      join: 'Join',
      leave: 'Leave',
      start: 'Start',
      stop: 'Stop',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      reset: 'Reset',
      close: 'Close',
      open: 'Open',
      expand: 'Expand',
      collapse: 'Collapse',
    },
    // Common labels for all pages
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      yes: 'Yes',
      no: 'No',
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Success!',
      noResults: 'No results found',
      confirm: 'Confirm',
      apply: 'Apply',
      reset: 'Reset',
    },
    // Authentication
    auth: {
      login: 'Login',
      logout: 'Logout',
      signup: 'Sign Up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      rememberMe: 'Remember Me',
      username: 'Username',
      firstName: 'First Name',
      lastName: 'Last Name',
      profile: 'Profile',
      settings: 'Settings',
    },
    // Forum
    forum: {
      title: 'Forum',
      createPost: 'Create Post',
      replyToPost: 'Reply to Post',
      categories: 'Categories',
      recentPosts: 'Recent Posts',
      popularPosts: 'Popular Posts',
      myPosts: 'My Posts',
      searchPlaceholder: 'Search posts...',
      noPosts: 'No posts found',
      postTitle: 'Post Title',
      postContent: 'Post Content',
      postCategory: 'Category',
      postTags: 'Tags',
      replies: 'Replies',
      views: 'Views',
      lastActivity: 'Last Activity',
    },
    // Group Study
    groupStudy: {
      title: 'Group Study',
      createGroup: 'Create Group',
      joinGroup: 'Join Group',
      myGroups: 'My Groups',
      availableGroups: 'Available Groups',
      groupName: 'Group Name',
      groupDescription: 'Description',
      subject: 'Subject',
      members: 'Members',
      maxMembers: 'Max Members',
      schedule: 'Schedule',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      full: 'Full',
      startCall: 'Start Call',
      joinCall: 'Join Call',
      startChat: 'Start Chat',
      joinChat: 'Join Chat',
    },
    // Calendar
    calendar: {
      title: 'Calendar',
      today: 'Today',
      month: 'Month',
      week: 'Week',
      day: 'Day',
      createEvent: 'Create Event',
      editEvent: 'Edit Event',
      deleteEvent: 'Delete Event',
      eventTitle: 'Event Title',
      eventDescription: 'Description',
      startTime: 'Start Time',
      endTime: 'End Time',
      location: 'Location',
      participants: 'Participants',
      reminder: 'Reminder',
      noEvents: 'No events scheduled',
    },
    // Settings
    settings: {
      title: 'Settings',
      appearance: 'Appearance',
      language: 'Language',
      notifications: 'Notifications',
      privacy: 'Privacy',
      account: 'Account',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      systemDefault: 'System Default',
      english: 'English',
      french: 'French',
      spanish: 'Spanish',
    },
    // Admin section
    admin: {
      panel: 'Admin Panel',
      title: 'Administration',
      dashboard: 'Dashboard',
      lessons: 'Lessons',
      practiceSets: 'Practice Sets',
      users: 'Users',
      feedback: 'Feedback',
      settings: 'Settings',
      // User management section
      users: {
        title: 'User Management',
        search: 'Search users',
        filters: 'Filters',
        resetFilters: 'Reset Filters',
        filterRole: 'Role',
        filterBanned: 'Banned Status',
        filterActive: 'Active Status',
        allRoles: 'All Roles',
        allUsers: 'All Users',
        roleUser: 'User',
        roleEditor: 'Editor',
        roleAdmin: 'Admin',
        bannedOnly: 'Banned Only',
        notBannedOnly: 'Not Banned',
        activeOnly: 'Active Only',
        inactiveOnly: 'Inactive Only',
        noUsers: 'No users found',
        deleteTitle: 'Delete User',
        deleteConfirmation: 'Are you sure you want to delete user {username}?',
        deleteWarning: 'This action will deactivate the user account. Users will no longer be able to access the platform.',
        editTitle: 'Edit User',
        updateSuccess: 'User updated successfully',
        updateError: 'Failed to update user',
        userInfo: 'User Information',
        roleAndStatus: 'Role and Status',
        username: 'Username',
        email: 'Email',
        name: 'Name',
        role: 'Role',
        isBanned: 'Banned',
        isActive: 'Active',
        bannedWarning: 'Banned users cannot access any part of the platform',
        inactiveWarning: 'Inactive users cannot log in to the platform',
        // DataGrid columns
        columns: {
          username: 'Username',
          email: 'Email',
          name: 'Name',
          role: 'Role',
          status: 'Status',
          joined: 'Joined Date',
          lastLogin: 'Last Login',
          actions: 'Actions'
        },
        // Actions
        actions: {
          edit: 'Edit User',
          delete: 'Delete User'
        }
      },
      // Feedback management section
      feedback: {
        title: 'User Feedback Review',
        searchPlaceholder: 'Search in feedback messages or emails',
        filterStatus: 'Filter by Status',
        allStatuses: 'All Statuses',
        statusNew: 'New',
        statusRead: 'Read',
        statusInProgress: 'In Progress',
        statusResolved: 'Resolved',
        statusArchived: 'Archived',
        noFeedback: 'No feedback items found',
        detailTitle: 'Feedback Details',
        messageContent: 'Message Content',
        metadata: 'Feedback Information',
        fromUser: 'From',
        submittedOn: 'Submitted on',
        context: 'Context',
        currentStatus: 'Current Status',
        updateStatus: 'Update Status',
        saveStatus: 'Save Status',
        statusUpdated: 'Status updated successfully',
        updateError: 'Failed to update status',
        noMessage: 'No message content',
        // DataGrid columns
        columns: {
          user: 'User',
          message: 'Message',
          context: 'Page',
          status: 'Status',
          submitted: 'Submitted',
          actions: 'Actions'
        },
        // Actions
        actions: {
          view: 'View Feedback',
          archive: 'Archive Feedback'
        }
      }
    },
    // Error messages
    errors: {
      required: 'This field is required',
      invalidEmail: 'Invalid email address',
      passwordMismatch: 'Passwords do not match',
      minLength: 'Must be at least {min} characters',
      maxLength: 'Must be at most {max} characters',
      invalidFormat: 'Invalid format',
      serverError: 'Server error occurred',
      networkError: 'Network error occurred',
      notFound: 'Not found',
      unauthorized: 'Unauthorized access',
    },
    // Success messages
    success: {
      saved: 'Successfully saved',
      created: 'Successfully created',
      updated: 'Successfully updated',
      deleted: 'Successfully deleted',
      loggedIn: 'Successfully logged in',
      loggedOut: 'Successfully logged out',
      registered: 'Successfully registered',
    },
  },
  fr: {
    // Navigation
    nav: {
      home: 'Accueil',
      lessons: 'Leçons',
      practice: 'Exercices',
      solver: 'Solveur',
      forum: 'Forum',
      groupStudy: 'Étude de Groupe',
      calendar: 'Calendrier',
      profile: 'Profil',
      settings: 'Paramètres',
    },
    // Common actions
    actions: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      create: 'Créer',
      search: 'Rechercher',
      filter: 'Filtrer',
      sort: 'Trier',
      view: 'Voir',
      reply: 'Répondre',
      join: 'Rejoindre',
      leave: 'Quitter',
      start: 'Démarrer',
      stop: 'Arrêter',
      next: 'Suivant',
      previous: 'Précédent',
      submit: 'Soumettre',
      reset: 'Réinitialiser',
      close: 'Fermer',
      open: 'Ouvrir',
      expand: 'Développer',
      collapse: 'Réduire',
    },
    // Authentication
    auth: {
      login: 'Connexion',
      logout: 'Déconnexion',
      signup: "S'inscrire",
      email: 'Email',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      forgotPassword: 'Mot de passe oublié ?',
      rememberMe: 'Se souvenir de moi',
      username: "Nom d'utilisateur",
      firstName: 'Prénom',
      lastName: 'Nom',
      profile: 'Profil',
      settings: 'Paramètres',
    },
    // Forum
    forum: {
      title: 'Forum',
      createPost: 'Créer un post',
      replyToPost: 'Répondre au post',
      categories: 'Catégories',
      recentPosts: 'Posts récents',
      popularPosts: 'Posts populaires',
      myPosts: 'Mes posts',
      searchPlaceholder: 'Rechercher des posts...',
      noPosts: 'Aucun post trouvé',
      postTitle: 'Titre du post',
      postContent: 'Contenu du post',
      postCategory: 'Catégorie',
      postTags: 'Tags',
      replies: 'Réponses',
      views: 'Vues',
      lastActivity: 'Dernière activité',
    },
    // Group Study
    groupStudy: {
      title: 'Étude en Groupe',
      createGroup: 'Créer un groupe',
      joinGroup: 'Rejoindre un groupe',
      myGroups: 'Mes groupes',
      availableGroups: 'Groupes disponibles',
      groupName: 'Nom du groupe',
      groupDescription: 'Description',
      subject: 'Sujet',
      members: 'Membres',
      maxMembers: 'Membres max',
      schedule: 'Planning',
      status: 'Statut',
      active: 'Actif',
      inactive: 'Inactif',
      full: 'Complet',
      startCall: 'Démarrer appel',
      joinCall: 'Rejoindre appel',
      startChat: 'Démarrer chat',
      joinChat: 'Rejoindre chat',
    },
    // Calendar
    calendar: {
      title: 'Calendrier',
      today: "Aujourd'hui",
      month: 'Mois',
      week: 'Semaine',
      day: 'Jour',
      createEvent: 'Créer événement',
      editEvent: 'Modifier événement',
      deleteEvent: 'Supprimer événement',
      eventTitle: 'Titre événement',
      eventDescription: 'Description',
      startTime: 'Heure début',
      endTime: 'Heure fin',
      location: 'Lieu',
      participants: 'Participants',
      reminder: 'Rappel',
      noEvents: 'Aucun événement prévu',
    },
    // Settings
    settings: {
      title: 'Paramètres',
      appearance: 'Apparence',
      language: 'Langue',
      notifications: 'Notifications',
      privacy: 'Confidentialité',
      account: 'Compte',
      darkMode: 'Mode sombre',
      lightMode: 'Mode clair',
      systemDefault: 'Système par défaut',
      english: 'Anglais',
      french: 'Français',
      spanish: 'Espagnol',
    },
    // Admin section
    admin: {
      panel: 'Panneau d\'administration',
      title: 'Administration',
      dashboard: 'Tableau de bord',
      lessons: 'Leçons',
      practiceSets: 'Exercices',
      users: 'Utilisateurs',
      feedback: 'Retours',
      settings: 'Paramètres',
      // User management section
      users: {
        title: 'Gestion des utilisateurs',
        search: 'Rechercher des utilisateurs',
        filters: 'Filtres',
        resetFilters: 'Réinitialiser les filtres',
        filterRole: 'Rôle',
        filterBanned: 'Statut banni',
        filterActive: 'Statut actif',
        allRoles: 'Tous les rôles',
        allUsers: 'Tous les utilisateurs',
        roleUser: 'Utilisateur',
        roleEditor: 'Éditeur',
        roleAdmin: 'Administrateur',
        bannedOnly: 'Banni uniquement',
        notBannedOnly: 'Non banni',
        activeOnly: 'Actif uniquement',
        inactiveOnly: 'Inactif uniquement',
        noUsers: 'Aucun utilisateur trouvé',
        deleteTitle: 'Supprimer l\'utilisateur',
        deleteConfirmation: 'Êtes-vous sûr de vouloir supprimer l\'utilisateur {username}?',
        deleteWarning: 'Cette action désactivera le compte de l\'utilisateur. Les utilisateurs ne pourront plus accéder à la plateforme.',
        editTitle: 'Modifier l\'utilisateur',
        updateSuccess: 'Utilisateur mis à jour avec succès',
        updateError: 'Échec de la mise à jour de l\'utilisateur',
        userInfo: 'Informations de l\'utilisateur',
        roleAndStatus: 'Rôle et statut',
        username: 'Nom d\'utilisateur',
        email: 'Email',
        name: 'Nom',
        role: 'Rôle',
        isBanned: 'Banni',
        isActive: 'Actif',
        bannedWarning: 'Les utilisateurs bannis ne peuvent accéder à aucune partie de la plateforme',
        inactiveWarning: 'Les utilisateurs inactifs ne peuvent se connecter à la plateforme',
        // DataGrid columns
        columns: {
          username: 'Nom d\'utilisateur',
          email: 'Email',
          name: 'Nom',
          role: 'Rôle',
          status: 'Statut',
          joined: 'Date d\'adhésion',
          lastLogin: 'Connexion récente',
          actions: 'Actions'
        },
        // Actions
        actions: {
          edit: 'Modifier l\'utilisateur',
          delete: 'Supprimer l\'utilisateur'
        }
      },
      // Feedback management section
      feedback: {
        title: 'Gestion des Retours',
        searchPlaceholder: 'Rechercher dans les messages ou emails',
        filterStatus: 'Filtrer par Statut',
        allStatuses: 'Tous les Statuts',
        statusNew: 'Nouveau',
        statusRead: 'Lu',
        statusInProgress: 'En Cours',
        statusResolved: 'Résolu',
        statusArchived: 'Archivé',
        noFeedback: 'Aucun retour trouvé',
        detailTitle: 'Détails du Retour',
        messageContent: 'Contenu du Message',
        metadata: 'Informations du Retour',
        fromUser: 'De',
        submittedOn: 'Soumis le',
        context: 'Contexte',
        currentStatus: 'Statut Actuel',
        updateStatus: 'Mettre à Jour le Statut',
        saveStatus: 'Enregistrer le Statut',
        statusUpdated: 'Statut mis à jour avec succès',
        updateError: 'Échec de la mise à jour du statut',
        noMessage: 'Pas de contenu de message',
        // DataGrid columns
        columns: {
          user: 'Utilisateur',
          message: 'Message',
          context: 'Page',
          status: 'Statut',
          submitted: 'Soumis',
          actions: 'Actions'
        },
        // Actions
        actions: {
          view: 'Voir le Retour',
          archive: 'Archiver le Retour'
        }
      }
    },
    // Error messages
    errors: {
      required: 'Ce champ est requis',
      invalidEmail: 'Adresse email invalide',
      passwordMismatch: 'Les mots de passe ne correspondent pas',
      minLength: 'Doit contenir au moins {min} caractères',
      maxLength: 'Doit contenir au plus {max} caractères',
      invalidFormat: 'Format invalide',
      serverError: 'Erreur serveur',
      networkError: 'Erreur réseau',
      notFound: 'Non trouvé',
      unauthorized: 'Accès non autorisé',
    },
    // Success messages
    success: {
      saved: 'Enregistré avec succès',
      created: 'Créé avec succès',
      updated: 'Mis à jour avec succès',
      deleted: 'Supprimé avec succès',
      loggedIn: 'Connecté avec succès',
      loggedOut: 'Déconnecté avec succès',
      registered: 'Inscrit avec succès',
    },
  },
  es: {
    // Navigation
    nav: {
      home: 'Inicio',
      lessons: 'Lecciones',
      practice: 'Práctica',
      solver: 'Solucionador',
      forum: 'Foro',
      groupStudy: 'Estudio Grupal',
      calendar: 'Calendario',
      profile: 'Perfil',
      settings: 'Configuración',
    },
    // Common actions
    actions: {
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Crear',
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      view: 'Ver',
      reply: 'Responder',
      join: 'Unirse',
      leave: 'Salir',
      start: 'Iniciar',
      stop: 'Detener',
      next: 'Siguiente',
      previous: 'Anterior',
      submit: 'Enviar',
      reset: 'Restablecer',
      close: 'Cerrar',
      open: 'Abrir',
      expand: 'Expandir',
      collapse: 'Colapsar',
    },
    // Authentication
    auth: {
      login: 'Iniciar Sesión',
      logout: 'Cerrar Sesión',
      signup: 'Registrarse',
      email: 'Correo electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      forgotPassword: '¿Olvidaste tu contraseña?',
      rememberMe: 'Recordarme',
      username: 'Nombre de usuario',
      firstName: 'Nombre',
      lastName: 'Apellido',
      profile: 'Perfil',
      settings: 'Configuración',
    },
    // Forum
    forum: {
      title: 'Foro',
      createPost: 'Crear Publicación',
      replyToPost: 'Responder a Publicación',
      categories: 'Categorías',
      recentPosts: 'Publicaciones Recientes',
      popularPosts: 'Publicaciones Populares',
      myPosts: 'Mis Publicaciones',
      searchPlaceholder: 'Buscar publicaciones...',
      noPosts: 'No se encontraron publicaciones',
      postTitle: 'Título de la Publicación',
      postContent: 'Contenido de la Publicación',
      postCategory: 'Categoría',
      postTags: 'Etiquetas',
      replies: 'Respuestas',
      views: 'Vistas',
      lastActivity: 'Última Actividad',
    },
    // Group Study
    groupStudy: {
      title: 'Estudio Grupal',
      createGroup: 'Crear Grupo',
      joinGroup: 'Unirse a Grupo',
      myGroups: 'Mis Grupos',
      availableGroups: 'Grupos Disponibles',
      groupName: 'Nombre del Grupo',
      groupDescription: 'Descripción',
      subject: 'Asignatura',
      members: 'Miembros',
      maxMembers: 'Máx. Miembros',
      schedule: 'Horario',
      status: 'Estado',
      active: 'Activo',
      inactive: 'Inactivo',
      full: 'Completo',
      startCall: 'Iniciar Llamada',
      joinCall: 'Unirse a Llamada',
      startChat: 'Iniciar Chat',
      joinChat: 'Unirse a Chat',
    },
    // Calendar
    calendar: {
      title: 'Calendario',
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      createEvent: 'Crear Evento',
      editEvent: 'Editar Evento',
      deleteEvent: 'Eliminar Evento',
      eventTitle: 'Título del Evento',
      eventDescription: 'Descripción',
      startTime: 'Hora de Inicio',
      endTime: 'Hora de Fin',
      location: 'Ubicación',
      participants: 'Participantes',
      reminder: 'Recordatorio',
      noEvents: 'No hay eventos programados',
    },
    // Settings
    settings: {
      title: 'Configuración',
      appearance: 'Apariencia',
      language: 'Idioma',
      notifications: 'Notificaciones',
      privacy: 'Privacidad',
      account: 'Cuenta',
      darkMode: 'Modo Oscuro',
      lightMode: 'Modo Claro',
      systemDefault: 'Predeterminado del Sistema',
      english: 'Inglés',
      french: 'Francés',
      spanish: 'Español',
    },
    // Admin section
    admin: {
      panel: 'Panel de Administración',
      title: 'Administración',
      dashboard: 'Tablero',
      lessons: 'Lecciones',
      practiceSets: 'Prácticas',
      users: 'Usuarios',
      feedback: 'Retroalimentación',
      settings: 'Configuración',
      // User management section
      users: {
        title: 'Gestión de Usuarios',
        search: 'Buscar usuarios',
        filters: 'Filtros',
        resetFilters: 'Restablecer filtros',
        filterRole: 'Rol',
        filterBanned: 'Estado Baneado',
        filterActive: 'Estado Activo',
        allRoles: 'Todos los roles',
        allUsers: 'Todos los usuarios',
        roleUser: 'Usuario',
        roleEditor: 'Editor',
        roleAdmin: 'Administrador',
        bannedOnly: 'Solo Baneados',
        notBannedOnly: 'No Baneados',
        activeOnly: 'Solo Activos',
        inactiveOnly: 'Solo Inactivos',
        noUsers: 'No se encontraron usuarios',
        deleteTitle: 'Eliminar Usuario',
        deleteConfirmation: '¿Está seguro de que desea eliminar el usuario {username}?',
        deleteWarning: 'Esta acción desactivará la cuenta del usuario. Los usuarios no podrán acceder a la plataforma.',
        editTitle: 'Editar Usuario',
        updateSuccess: 'Usuario actualizado exitosamente',
        updateError: 'Error al actualizar el usuario',
        userInfo: 'Información del Usuario',
        roleAndStatus: 'Rol y Estado',
        username: 'Nombre de Usuario',
        email: 'Correo Electrónico',
        name: 'Nombre',
        role: 'Rol',
        isBanned: 'Baneado',
        isActive: 'Activo',
        bannedWarning: 'Los usuarios baneados no pueden acceder a ninguna parte de la plataforma',
        inactiveWarning: 'Los usuarios inactivos no pueden iniciar sesión en la plataforma',
        // DataGrid columns
        columns: {
          username: 'Nombre de Usuario',
          email: 'Correo Electrónico',
          name: 'Nombre',
          role: 'Rol',
          status: 'Estado',
          joined: 'Fecha de Inscripción',
          lastLogin: 'Inicio de Sesión Reciente',
          actions: 'Acciones'
        },
        // Actions
        actions: {
          edit: 'Editar Usuario',
          delete: 'Eliminar Usuario'
        }
      },
      // Feedback management section
      feedback: {
        title: 'Revisión de Comentarios',
        searchPlaceholder: 'Buscar en mensajes o correos',
        filterStatus: 'Filtrar por Estado',
        allStatuses: 'Todos los Estados',
        statusNew: 'Nuevo',
        statusRead: 'Leído',
        statusInProgress: 'En Proceso',
        statusResolved: 'Resuelto',
        statusArchived: 'Archivado',
        noFeedback: 'No se encontraron comentarios',
        detailTitle: 'Detalles del Comentario',
        messageContent: 'Contenido del Mensaje',
        metadata: 'Información del Comentario',
        fromUser: 'De',
        submittedOn: 'Enviado el',
        context: 'Contexto',
        currentStatus: 'Estado Actual',
        updateStatus: 'Actualizar Estado',
        saveStatus: 'Guardar Estado',
        statusUpdated: 'Estado actualizado con éxito',
        updateError: 'Error al actualizar el estado',
        noMessage: 'Sin contenido de mensaje',
        // DataGrid columns
        columns: {
          user: 'Usuario',
          message: 'Mensaje',
          context: 'Página',
          status: 'Estado',
          submitted: 'Enviado',
          actions: 'Acciones'
        },
        // Actions
        actions: {
          view: 'Ver Comentario',
          archive: 'Archivar Comentario'
        }
      }
    },
    // Error messages
    errors: {
      required: 'Este campo es obligatorio',
      invalidEmail: 'Correo electrónico inválido',
      passwordMismatch: 'Las contraseñas no coinciden',
      minLength: 'Debe tener al menos {min} caracteres',
      maxLength: 'Debe tener como máximo {max} caracteres',
      invalidFormat: 'Formato inválido',
      serverError: 'Error del servidor',
      networkError: 'Error de red',
      notFound: 'No encontrado',
      unauthorized: 'Acceso no autorizado',
    },
    // Success messages
    success: {
      saved: 'Guardado exitosamente',
      created: 'Creado exitosamente',
      updated: 'Actualizado exitosamente',
      deleted: 'Eliminado exitosamente',
      loggedIn: 'Sesión iniciada exitosamente',
      loggedOut: 'Sesión cerrada exitosamente',
      registered: 'Registrado exitosamente',
    },
  },
};

/**
 * Language provider component that manages language selection and translations
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Language provider component
 */
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    try {
      const savedLanguage = localStorage.getItem('language');
      return savedLanguage || 'en';
    } catch (error) {
      console.error('Error reading language preference:', error);
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('language', language);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  }, [language]);

  /**
   * Translates a key using the current language
   * @param {string} key - The translation key (dot notation supported)
   * @param {Object} [params] - Optional parameters for string interpolation
   * @returns {string} The translated string
   */
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }

    return value.replace(/\{(\w+)\}/g, (match, param) => {
      return params[param] !== undefined ? params[param] : match;
    });
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext; 