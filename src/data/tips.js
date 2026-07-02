const tips = {
    oxygen: {
        cause: 'Oxygène épuisé.',
        explanation: 'Votre réserve d’oxygène est tombée à zéro avant la maîtrise complète de l’incendie.',
        tip: 'Intervenez plus vite, évitez de rester trop longtemps près des foyers et utilisez le bon débit.'
    },

    weak_on_large: {
        cause: 'Le brasier a résisté.',
        explanation: 'Le jet faible ne suffit pas contre les gros foyers.',
        tip: 'Utilisez le jet puissant pour attaquer les brasiers importants.'
    },

    no_resource: {
        cause: 'Réserve épuisée.',
        explanation: "Le jet puissant consomme rapidement l'agent d'extinction.",
        tip: 'Utilisez le jet faible sur les petits foyers pour économiser votre réserve.'
    },

    door_danger: {
        cause: 'Ouverture dangereuse.',
        explanation: 'Une porte suspecte peut cacher une montée brutale de flammes.',
        tip: 'Inspectez les portes avec X avant de les ouvrir.'
    },

    fuel_fire: {
        cause: 'Propagation du carburant.',
        explanation: "L'eau peut aggraver certains feux de carburant.",
        tip: 'Rejoignez le camion ou une réserve adaptée pour utiliser la mousse.'
    },

    vehicle_explosion: {
        cause: 'Explosion du véhicule.',
        explanation: 'Un véhicule en feu représente un danger immédiat.',
        tip: 'Gardez vos distances et traitez le foyer sans rester collé à la voiture.'
    },

    default: {
        cause: 'Intervention interrompue.',
        explanation: "L'incendie n'a pas pu être maîtrisé.",
        tip: 'Observez la situation et adaptez votre intervention.'
    }
};

export default tips;