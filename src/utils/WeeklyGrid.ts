// Fonction pour obtenir la date du lundi de la semaine actuelle
export function getMonday(d: any) {
  d = new Date(d);
  var day = d.getDay(),
    diff = d.getDate() - day + (day === 0 ? -6 : 1); // ajuste lorsque le jour est dimanche
  return new Date(d.setDate(diff));
}

// Fonction pour obtenir la date du dimanche de la semaine actuelle
export function getSunday(d: any) {
  return new Date(getMonday(d).getTime() + 6 * 24 * 60 * 60 * 1000); // Ajoute 6 jours au lundi
}
