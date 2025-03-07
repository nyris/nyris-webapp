import React from 'react';
import { Language } from './types';

const translations = (language: Language) => {
  const dictionaries: Record<'de' | 'en' | 'fr', any> = {
    de: {
      Search: 'Suche',
      'Analyzing image...': 'Bild wird analysiert...',
      'Hold on': 'Bitte warten.',
      'We are working hard on finding the product':
        'Wir arbeiten daran, das Produkt zu finden.',
      'Success!': 'Erfolg!',
      'matches found': 'Übereinstimmungen wurden gefunden.',
      'match found': 'Übereinstimmungen wurden gefunden.',
      'View more': 'Mehr anzeigen',
      'Something went wrong': 'Etwas ist schief gelaufen',
      'Oops!':
        'Hoppla! Bei der Suche ist ein Problem aufgetreten. Bitte stellen Sie sicher, dass Ihr Bild den Richtlinien entspricht und versuchen Sie es erneut.',
      'Upload a picture': 'Laden Sie ein Bild hoch',
      'Drag and drop an image here': 'Bild hierher ziehen',
      'Browse gallery': 'Galerie durchsuchen',
      'Take a photo': 'Foto aufnehmen',
      'Test Visual Search Widget': 'Testen Sie das visuelle Such-Widget',
      'Enter your api key and submit': 'Geben Sie Ihren API-Key ein',
      'API key': 'API-Key',
      'Your API key here': 'API-Key hier',
      Submit: 'Absenden',
      'Open visual search': 'Visuelle Suche öffnen',
      'Let’s try that again': 'Versuchen wir es noch einmal',
      'We couldn’t find matches':
        'Diesmal konnten wir keine Übereinstimmungen finden.',
      'For the best results, please use':
        'Um die besten Ergebnisse zu erzielen, verwenden Sie bitte ein scharfes, gut beleuchtetes und zentriertes Foto mit einem ruhigen Hintergrund und versuchen Sie es noch einmal!',
      'Click a picture': 'Klicken Sie auf ein Bild',
      'Back to request image': 'Zurück zur Bildanfrage',
      'View full description': 'Vollständige Beschreibung anzeigen',
      'Drag an image or click to upload':
        'Bild ziehen oder klicken zum Hochladen.',
      "We couldn't find matches based on <prefilters>":
        'Wir konnten keine Ergebnisse basierend auf <prefilters> finden.',
      'based on': 'basierend auf',
      'Refine your search results': 'Verfeinern Sie Ihre Suchergebnisse',
      'Are these results useful?': 'Sind diese Ergebnisse nützlich?',
      'Thanks for your feedback!': 'Vielen Dank für Ihr Feedback!',
      Clear: 'Löschen',
      'Clear all': 'Alles löschen',
      Cancel: 'Abbrechen',
      Apply: 'Anwenden',
    },
    en: {
      Search: 'Search',
      'Analyzing image...': 'Analyzing image...',
      'Hold on': 'Hold on',
      'We are working hard on finding the product':
        'We are working hard on finding the product',
      'Success!': 'Success!',
      'matches found': 'matches found',
      'match found': 'match found',
      'View more': 'View more',
      'Something went wrong': 'Something went wrong',
      'Oops!':
        'Oops! We encountered an issue during the search. Please ensure your image meets the guidelines and try again',
      'Upload a picture': 'Upload a picture',
      'Drag and drop an image here': 'Drag and drop an image here',
      'Browse gallery': 'Browse gallery',
      'Take a photo': 'Take a photo',
      'Test Visual Search Widget': 'Test Visual Search Widget',
      'Enter your api key and submit': 'Enter your api key and submit',
      'API key': 'API key',
      'Your API key here': 'Your API key here',
      Submit: 'Submit',
      'Open visual search': 'Open visual search',
      'Let’s try that again': 'Let’s try that again',
      'We couldn’t find matches': 'We couldn’t find matches this time.',
      'For the best results, please use':
        'For the best results, please use a sharp, well-lit, and centered photo with a clean background, and give it another go!',
      'Click a picture': 'Click a picture',
      'Back to request image': 'Back to request image',
      'View full description': 'View full description',
      'Drag an image or click to upload': 'Drag an image or click to upload',
      "We couldn't find matches based on <prefilters>":
        "We couldn't find matches based on <prefilters>.",
      'based on': 'based on',
      'Refine your search results': 'Refine your search results',
      'Are these results useful?': 'Are these results useful?',
      'Thanks for your feedback!': 'Thanks for your feedback!',
      Clear: 'clear',
      'Clear all': 'clear all',
      Cancel: 'Cancel',
      Apply: 'Apply',
    },
    fr: {
      Search: 'Recherche',
      'Analyzing image...': 'Analyse de l\'image...',
      'Hold on': 'Attendez',
      'We are working hard on finding the product':
        'Nous travaillons d\'arrache-pied pour trouver le produit',
      'Success!': 'Succès!',
      'matches found': 'correspondances trouvées',
      'match found': 'correspondance trouvée',
      'View more': 'Voir plus',
      'Something went wrong': 'Quelque chose n\'a pas fonctionné',
      'Oops!':
        'Oups ! Nous avons rencontré un problème lors de la recherche. Veuillez vous assurer que votre image est conforme aux lignes directrices et réessayez.',
      'Upload a picture': 'Télécharger une image',
      'Drag and drop an image here': 'Glisser-déposer une image ici',
      'Browse gallery': 'Parcourir la galerie',
      'Take a photo': 'Prendre une photo',
      'Test Visual Search Widget': 'Test du widget de recherche visuelle',
      'Enter your api key and submit': 'Saisissez votre clé api et validez',
      'API key': 'Clé API',
      'Your API key here': 'Votre clé API ici',
      Submit: 'Soumettre',
      'Open visual search': 'Recherche visuelle ouverte',
      'Let’s try that again': 'Essayons encore une fois',
      'We couldn’t find matches': 'Nous n\'avons pas trouvé de correspondance cette fois-ci.',
      'For the best results, please use':
        'Pour obtenir les meilleurs résultats, utilisez une photo nette, bien éclairée et centrée, avec un arrière-plan propre, et recommencez !',
      'Click a picture': 'Cliquez sur une image',
      'Back to request image': 'Retour à la demande d\'image',
      'View full description': 'Voir la description complète',
      'Drag an image or click to upload': 'Faites glisser une image ou cliquez pour la télécharger',
      "We couldn't find matches based on <prefilters>":
        "Nous n'avons pas trouvé de correspondance basée sur <prefilters>.",
      'based on': 'sur la base de',
      'Refine your search results': 'Affiner les résultats de votre recherche',
      'Are these results useful?': 'Ces résultats sont-ils utiles ?',
      'Thanks for your feedback!': 'Merci pour vos commentaires !',
      Clear: 'clair',
      'Clear all': 'tout effacer',
      Cancel: 'Annuler',
      Apply: 'Appliquer',
    },
  };

  const dictionary = dictionaries[language] || dictionaries.en;

  return new Proxy(dictionary, {
    get(target, prop) {
      if (typeof prop === 'string' && prop in target) {
        const translation = target[prop];
        if (translation.includes('<') && translation.includes('>')) {
          return (params: any = {}) => {
            return translation
              .split(/(<[a-zA-Z0-9_]+>)/g)
              .map((part: string, index: React.Key | null | undefined) => {
                const match = part.match(/^<([a-zA-Z0-9_]+)>$/);
                if (match) {
                  const key = match[1];
                  const value = params[key] || `<${key}>`;
                  if (params.style === 'bold') {
                    return <b key={index}>{value}</b>;
                  }
                  return <span key={index}>{value}</span>;
                }
                return part;
              });
          };
        }
        return translation;
      }
      return undefined;
    },
  });
};

export default translations;
