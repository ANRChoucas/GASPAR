//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
// choucas_experiment.js: The functionality for the experiment
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

function susInput(id) {
  return "<select id='" + id + "' style='float:left;'>" +
            "<option value='5'>5 - Fortement d'accord</option>" +
            "<option value='4'>4</option>" +
            "<option value='3'>3</option>" +
            "<option value='2'>2</option>" +
            "<option value='1'>1 - Désapprouve fortement</option>" +
          "</select>";
}

function skillInput(id) {
  return "<select id='" + id + "' style='width: 100%; margin-bottom: 10px;'>" +
            "<option value='5'>5 - Expert</option>" +
            "<option value='4'>4</option>" +
            "<option value='3'>3</option>" +
            "<option value='2'>2</option>" +
            "<option value='1'>1 - Débutant</option>" +
          "</select>";
}


//-----------------------------------------------------------------------------
// Tutorial Functionality
//-----------------------------------------------------------------------------
var tutorialSteps = {
  1: {
    "TitleEN": "Welcome",
    "TextEN": "Welcome to the Choucas mountain search and rescue experiment. Please enter your details: <br/> \
               <div style='padding: 5px 8px;'> \
               Name: <br/> <input id='userDetailsName' style='width: 100%; margin-bottom: 5px;'></input> <br/> \
               </div> \
               Click next to follow the experiment instructions.",

    "TitleFR": "Bienvenue",
    "TextFR": "Merci de participer à l'expérience Choucas sur la recherche et le sauvetage en montagne. Veuillez remplir:<br/> \
               <div style='padding: 5px 8px;'> \
               Votre nom: <input id='userName' style='width: 100%; margin-bottom: 10px;'></input><br/> \
               Évaluez vos compétences informatiques:<br/>" + skillInput("itSkills") + "<br/> \
               Évaluez vos compétences en logiciels cartographiques:<br/>" + skillInput("gisSkills") + "<br/> \
               Votre clé IGN: <input id='ignKey' style='width: 100%; margin-bottom: 10px;'></input><br/> \
               Votre identifiant IGN (user:pass): <input id='ignLogin' style='width: 100%; margin-bottom: 10px;'></input><br/> \
               </div style='margin-bottom: 5px;'> \
               <b>Puis cliquez sur suivant</b>"
  },
  2: {
    "TitleEN": "Introduction",
    "TextEN": "The Choucas mountain search and rescue software allows you to take a set of clues given by the victim and find matching areas on the map. <br/><br/> \
               This experiment starts by walking you through a simple example of how to use the functionality. \
               Then you will be given a real scenario, where you will conduct the search yourself and finish by marking the area you think the victim is most likely located and uploading your result. <br/><br/> \
               Click next to start the example walkthrough.",

    "TitleFR": "Introduction",
    "TextFR": "Dans l'environnement Choucas, vous pouvez saisir une série d'indices donnés par une victime perdue en montagne et identifier les zones spatiales correspondantes sur la carte. <br/><br/> \
               En prélude à cette expérience, nous montrons un exemple simple d'utilisation, pour présenter le fonctionnement de l'interface. \
               Ensuite l'expérience consistera à suivre un scénario de recherche, durant lequel vous tenterez d'identifier la zone où se trouve une personne perdue en montagne, à partir de sa description des lieux. <br/><br/> \
               <b>Cliquez sur suivant pour démarrer le scénario d'exemple.</b>"
  },
  3: {
    "TitleEN": "Example Step 1",
    "TextEN": "<b>Set the intial search area:</b> <br/> \
               <ul style='margin: 5px 15px; padding: 0;'> \
                 <li>Search for & select 'Croix de Chamrousse' in the item tree</li> \
                 <li>Enter 3 into the buffer field to define a 3km search zone </li> \
                 <li>Add this filter to Scenario 1 by ticking the checkbox</li> \
                 <li>Click zoom to current zone</li> \
                 <li>Click 'Load OSM objects' to load all objects for this zone</li> \
               </ul>Move to next tutorial step.",

    "TitleFR": "Exemple Étape 1",
    "TextFR": "<b>Définir la zone de recherche initiale:</b> <br/> \
               <ul style='margin: 5px 15px; padding: 0;'> \
                 <li>Recherchez et sélectionnez 'Croix de Chamrousse' dans l'arbre des objets d'intérêt</li> \
                 <li>Entrez 3 dans le champ 'Buff.' pour définir une zone de recherche de 3 km autour de la Croix de Chamrousse</li> \
                 <li>Ajoutez ce filtre au scénario 1 en cochant la case</li> \
                 <li>Cliquez sur 'Zoom sur la zone de recherche'</li> \
                 <li>Cliquez sur 'Charger les objets OSM' pour charger tous les objets de cette zone</li> \
               </ul><b>Puis cliquez sur suivant</b>"
  },
  4: {
    "TitleEN": "Example Step 2",
    "TextEN": "<b>Filter the search tree: </b><br/> \
               <ul style='margin: 5px 15px; padding: 0;'> \
                 <li>Hover over the items in the tree to see them on the map</li> \
                 <li>Click 'Filter tree to current zone'. Now we only see the pathways etc. near the current zone. </li> \
                 <li>This is an important method to reduce the number of items in scope with large layers (e.g. all pathways) to keep the zone calculations performant</li> \
               </ul>Move to next tutorial step.",

    "TitleFR": "Exemple Étape 2",
    "TextFR": "<b>Filtrer l'arbre de recherche: </b><br/> \
               <ul style='margin: 5px 15px; padding: 0;'> \
                 <li>Survoler les éléments de l'arbre pour les voir sur la carte</li> \
                 <li>Cliquez sur 'Filtrer l'arbre pour la zone de recherche'. Maintenant, Les éléments de l'arbre (chemins, pistes de ski, etc.) sont limités à ceux présents dans la zone de recherche</li> \
                 <li>Cette méthode permet de réduire le nombre d'éléments à prendre en compte dans la poursuite de la recherche</li> \
               </ul><b>Puis cliquez sur suivant</b>"
  },
  5: {
    "TitleEN": "Example Step 3",
    "TextEN": "<b>Add a search criteria: </b><br/> \
               <ul style='margin: 5px 15px; padding: 0;'> \
                 <li>Click 'Add Filter' to add a new search criteria</li> \
                 <li>Expand Plan d'eau, then select Lacs and Resevoirs</li> \
                 <li>Enter a buffer of 0.1 to model 'By a lake'</li> \
                 <li>Enable this new filter in Scenario 1</li> \
                 <li>Set distance field to 0.2 to model 'See a lake 200m away'</li> \
               </ul>Move to next tutorial step.",

    "TitleFR": "Exemple Étape 3",
    "TextFR": "<b>Ajouter un critère de recherche: </b><br/> \
               <ul style='margin: 5px 15px; padding: 0;'> \
                 <li>Cliquez sur 'Ajouter un filtre'</li> \
                 <li>Ouvrez le dossier 'Plan d'eau', puis sélectionnez 'Lacs' et 'Réservoirs' </li> \
                 <li>Entrez 0.1 dans le champ 'Buff.' (buffer) pour retranscrire l'indice 'Je suis à côté d'un lac'</li> \
                 <li>Entrez 0.2 dans le champ 'Dist.' (distance), et maintenant le filtre retranscrire l'indice 'je suis à 200m d'un lac' </li> \
                 <li>Activer ce nouveau filtre dans le scénario 1</li> \
               </ul><b>Puis cliquez sur suivant</b>"
  },
  6: {
    "TitleEN": "Example Step 4",
    "TextEN": "<b>Add further search criteria: </b><br/> \
               <ul style='margin: 5px 15px; padding: 0;'> \
                 <li>Click 'Add Filter' to add a new search criteria</li> \
                 <li>Select ski lifts</li> \
                 <li>Set a buffer of 0.1 to model 'Under a ski lift'</li> \
                 <li>Enable this new filter in Scenario 1.</li> \
                 <li>You can easily enable / disable filters to see the impact</li> \
               </ul>Move to next tutorial step.",

    "TitleFR": "Exemple Étape 4",
    "TextFR": "<b>Ajouter d'autres critères de recherche: </b><br/> \
               <ul style='margin: 5px 15px; padding: 0;'> \
                 <li>Cliquez sur 'Ajouter un filtre'</li> \
                 <li>Sélectionnez les remontées mécaniques</li> \
                 <li>Définir un Buffer de 0.1 pour retranscrire l'indice 'Je suis sous une remontée mécanique'</li> \
                 <li>Activer ce nouveau filtre dans le scénario 1</li> \
                 <li>Vous pouvez facilement activer ou désactiver les filtres pour observer leur impact sur le scénario de recherche</li> \
                 <li>Vous pouvez cacher les objets ou les zones relatives à chaque filtre, à l'aide des cases à cocher sous le nom 'Afficher', à gauche de la table des filtres.</li> \
               </ul><b>Puis cliquez sur suivant</b>"
  },
  7: {
    "TitleEN": "Example Step 5",
    "TextEN": "<b>Mark the most likely zone: </b><br/> \
               <ul style='margin: 5px 15px; padding: 0;'> \
                 <li>When you have finished your search, draw a polygon representing the area that you think the victim is located</li> \
                 <li>In this simple example we could draw 3 polygons over the 4 zones identified</li> \
                 <li>However in more complex cases e.g. the victim is above a refuge, it may be that with manual inspection you can draw a smaller most likely zone by ruling out downhill sections</li> \
                 <li>Experiment with the drawing functionality. Note that you can edit the drawn polygons </li> \
               </ul>Move to next tutorial step.",

    "TitleFR": "Exemple Étape 5",
    "TextFR": "<b>Identifier les zones où peut se trouver la victime:</b><br/> \
               <ul style='margin: 5px 15px; padding: 0;'> \
                 <li>Lorsque vous avez terminé votre recherche, vous pouvez dessiner des polygones représentant les zones où vous estimez que la victime peut se trouver.</li> \
                 <li>Dans cet exemple simple, nous identifions quatre zones où se situe potentiellement la victime.</li> \
                 <li>Dans des cas plus complexes où nous possédons plus d'indices (ex: 'la victime est au-dessus d'un refuge'), nous pouvons déterminer visuellement une zone plus fine que celles identifiées par le système.</li> \
                 <li>Dessinez ces zones avec la fonction de dessin (c'est possible aussi de modifier les polygones) </li> \
               </ul> \
               <button id='drawManualZone' onclick='drawManualZone()' class='choucas-btn' style='width: 100%;'>Dessiner les zones la plus probable</button> \
               <button id='confirmManualZone' onclick='confirmManualZone()' class='choucas-btn' style='width: 49.5%;'>Confirmer zones</button> \
               <button id='cancelManualZone' onclick='clearManualZones()' class='choucas-btn' style='width: 49.5%; margin-bottom: 10px;'>Effacer zones</button> <br/> \
               <b>Puis cliquez sur suivant</b>"
  },
  8: {
    "TitleEN": "Recap",
    "TextEN": "Core concepts:<br/> \
               <ul style='margin: 5px 15px; padding: 0;'> \
                 <li>Take a clue from the victim (e.g. I am near to a lake)</li> \
                 <li>Select openstreetmap objects from the tree (e.g. all lakes)</li> \
                 <li>Define a zone around the selected objects using the buffer and distance fields (e.g. within 500m of a lake)</li> \
                 <li>This now constitutes a 'Filter'</li> \
                 <li>Now add additional filters for each piece of information and enable these in a scenario to see how they combine</li> \
               </ul>Move to next tutorial step.",

    "TitleFR": "Récapitulatif",
    "TextFR": "<b>Récapitulatif du processus de recherche:</b><br/> \
               <ol style='margin: 5px 15px; padding: 0;'> \
                 <li>Ajouter un filtre et prenez un indice de la victime ('je suis près d'un lac')</li> \
                 <li>Sélectionnez les objets correspondants dans l'arbre (tous les lacs)</li> \
                 <li>Définir une zone autour des objets sélectionnés en utilisant les champs de Buffer ('Buff.') et de Distance ('Dist.') (à moins de 500m d'un lac) </li> \
                 <li>Répétez ce processus pour créer des filtres pour chaque indice, et activez ces filtres dans un scénario de recherche pour voir comment ils se combinent </li> \
               </ol><b>Puis cliquez sur suivant</b>"
  },
  9: {
    "TitleEN": "Experiment",
    "TextEN": "For this experiment you will now be given a real scenario where you must try and identify the smallest posisble zone where you think the victim is located. \
               Note that as shown in the tutorial you will mark your final zone manually, so the filter functionality is a tool to help you, but you can also use manual reasoning \
               to narrow down the zone further for spatial relations such as above / below<br/><br/> \
               <b>When you click the next button the experiment will begin.</b>",

    "TitleFR": "Expérience",
    "TextFR": "Vous allez maintenant effectuer un scénario où vous devez essayer d'identifier la plus petite zone possible où vous pensez que la victime est située.<br/><br/> \
               Notez que, comme indiqué dans le tutoriel, vous déterminerez votre zone finale visuellement. La fonction de filtre est donc un outil pour vous aider dans votre recherche, \
               mais vous pouvez également effectuer votre recherche visuellement directement dans la carte (notamment pour affiner la zone dans le cas d'indices tels que 'je suis au dessus / au dessous de ... ')<br/><br/> \
               <b>Cliquez sur suivant pour commencer l'expérience</b>"
  },
  10: {
    "TitleEN": "Experiment",
    "TextEN": "<b>Conduct a search for the below scenario: </b><br/> \
               <ul style='margin: 5px 15px; padding: 0;'> \
                 <li>Partie de Bourg d'Oisans, à pied, sur chemin</li> \
                 <li>Marché plusieurs heures, en direction d'une station de ski</li> \
                 <li>Chuté de plusieurs mètres</li> \
                 <li>Voit une partie de plan d'eau</li> \
                 <li>Sous une route et entend des véhicules</li> \
                 <li>Sous une ligne électrique à 3 brins</li> \
                 <li>Vient de passer du soleil à l'ombre</li> \
                 <li>Cellule GSM SFR à Villard-Reymond, orientée au 90° (est)</li> \
               </ul><b>Click next when you are ready to mark the zone where you think the victim is most likely located. </b>",

    "TitleFR": "Expérience",
    "TextFR": "<b>Faites une recherche pour ce scénario: </b><br/> \
               <ul style='margin: 5px 15px; padding: 0;'> \
                 <li>Partie de Bourg d'Oisans, à pied, sur chemin</li> \
                 <li>Marché plusieurs heures, en direction d'une station de ski</li> \
                 <li>Chuté de plusieurs mètres</li> \
                 <li>Voit une partie de plan d'eau</li> \
                 <li>Sous une route et entend des véhicules</li> \
                 <li>Sous une ligne électrique 3 brins</li> \
                 <li>Vient de passer du soleil à l'ombre</li> \
                 <li>Cellule GSM SFR à Villard-Reymond, orientée au 90° (est)</li> \
               </ul><b>Cliquez sur Suivant lorsque vous êtes prêt à identifier la zone où vous pensez que la victime se situe.</b>"
  },
  11: {
    "TitleEN": "Experiment",
    "TextEN": "<b>Enter Results:</b><br/>\
               Please click the draw most likely zone button bellow and draw polygons to represent the most likely areas.<br/> \
               <button id='drawManualZone' onclick='drawManualZone()' class='choucas-btn' style='width: 100%;'>Dessiner les zones les plus probables</button> \
               <button id='confirmManualZone' onclick='confirmManualZone()' class='choucas-btn' style='width: 100%;'>Confirmer zones</button> \
               <button id='cancelManualZone' onclick='clearManualZones()' class='choucas-btn' style='width: 100%; margin-bottom: 10px;'>Effacer zones</button> <br/> \
               Please write a quick overview of your reasoning / any remarks you have from your search \
               <textarea rows='4' style='width:100%;' style='margin-bottom: 10px;'>...</textarea><br/> \
               <b>Click next to submit results.</b>",

    "TitleFR": "Expérience",
    "TextFR": " <b>Marquer la zone la plus probable où peut se trouver la victime:</b><br/> \
               Veuillez cliquer sur le bouton 'Dessiner la zone la plus probable' pour commencer à déterminer la zone où se trouve la victime.<br/> \
               <button id='drawManualZone' onclick='drawManualZone()' class='choucas-btn' style='width: 100%;'>Dessiner les zones la plus probable</button> \
               <button id='confirmManualZone' onclick='confirmManualZone()' class='choucas-btn' style='width: 49.5%;'>Confirmer zones</button> \
               <button id='cancelManualZone' onclick='clearManualZones()' class='choucas-btn' style='width: 49.5%; margin-bottom: 10px;'>Effacer zones</button> <br/> \
               Veuillez écrire un bref descriptif de votre raisonnement / des remarques que vous pouvez avoir sur  votre recherche et sur cet environnement ...  \
               <textarea rows='4' style='width:100%; margin-bottom: 5px;'>...</textarea> <br/> \
               <div><b>Puis cliquez sur suivant</b></div>"
  },
  12: {
    "TitleEN": "Questionnaire",
    "TextEN": "",

    "TitleFR": "Questionnaire",
    "TextFR": "1. Veuillez écrire un bref descriptif des points intéressants dans votre recherche, et aussi le raisonnement à la main  \
               <textarea id='questionReasoning' rows='3' style='width:100%; margin-bottom: 5px;'></textarea> <br/><br/> \
               \
               <table> \
               <tr><td style='width: 600px;'>2. Je pense que je voudrais utiliser ce système régulièrement:<br/> </td><td>" + susInput("sus1") + "</td></tr><tr><td>-</td></tr> \
               <tr><td style='width: 600px;'>3. Je trouve ce système inutilement complexe:<br/> </td><td>" + susInput("sus2") + "</td></tr><tr><td>-</td></tr> \
               <tr><td style='width: 600px;'>4. Je trouve que le système est facile d’utilisation:<br/> </td><td>" + susInput("sus3") + "</td></tr><tr><td>-</td></tr> \
               <tr><td style='width: 600px;'>5. Je pense que j’aurais besoin d’une assistance technique pour être capable d’utiliser ce système:<br/> </td><td>" + susInput("sus4") + "</td></tr><tr><td>-</td></tr> \
               <tr><td style='width: 600px;'>6. Je trouve que les nombreuses fonctions du système sont bien intégrées:<br/> </td><td>" + susInput("sus5") + "</td></tr><tr><td>-</td></tr> \
               <tr><td style='width: 600px;'>7. Je trouve qu’il y a trop d’incohérences dans ce système:<br/> </td><td>" + susInput("sus6") + "</td></tr><tr><td>-</td></tr> \
               <tr><td style='width: 600px;'>8. Je peux bien imaginer que la plupart des personnes pourraient rapidement apprendre à utiliser ce système:<br/> </td><td>" + susInput("sus7") + "</td></tr><tr><td>-</td></tr> \
               <tr><td style='width: 600px;'>9. Je trouve que ce système est fastidieux:<br/> </td><td>" + susInput("sus8") + "</td></tr><tr><td>-</td></tr> \
               <tr><td style='width: 600px;'>10. Je me sens à l’aise en utilisant le système:<br/> </td><td>" + susInput("sus9") + "</td></tr><tr><td>-</td></tr> \
               <tr><td style='width: 600px;'>11. J’ai besoin d’apprendre beaucoup de choses avant de pouvoir aborder ce système:<br/> </td><td>" + susInput("sus10") + "</td></tr><tr><td>-</td></tr> \
               </table> <br/> \
               12. Veuillez écrire des remarques ou idées que vous pouvez avoir sur cet environnement  \
               <textarea id='questionFeedback' rows='3' style='width:100%; margin-bottom: 5px;'></textarea> <br/> \
               <b>Puis cliquez sur suivant</b>"
  },
  13: {
    "TitleEN": "Experiment: Submit Results",
    "TextEN": "<b>Submit the results: </b><br/> \
               Please download the results file by clicking the button below, <b>then email the file to matthew.sreeves@grenoble-inp.org</b><br/> \
               <button id='drawManualZone' onclick='drawManualZone()' class='choucas-btn' style='width: 100%;'>Dessiner les zones la plus probable</button> \
               Thank you for your time.",

    "TitleFR": "Expérience",
    "TextFR": "<b>Soumettre les résultats:</b><br/> \
               Veuillez télécharger le fichier de résultats en cliquant sur le bouton ci-dessous, <b>puis envoyer le fichier par courrier électronique à matthew.sreeves@grenoble-inp.org</b><br/> \
               <button id='downloadResultsFile' onclick='outputLogToFile()' class='choucas-btn' style='width: 100%; margin: 5px 0px;'>Télécharger le fichier de résultats</button> \
               <b>Merci pour votre temps.</b>",
  }
}



var userName = "";
var itSkills = "";
var gisSkills = "";
var ignKey = "";
var ignLogin = "";
var sus1 = "";
var sus2 = "";
var sus3 = "";
var sus4 = "";
var sus5 = "";
var sus6 = "";
var sus7 = "";
var sus8 = "";
var sus9 = "";
var sus10 = "";
var questionReasoning = "";
var questionFeedback = "";



var experimentStarted = false;
var tutorialStepsSize = Object.keys(tutorialSteps).length;
var tutorialIndex = 0;

function startExperiment() {
  startLogSection("Tutorial");
  choucasLog("----- Starting Tutorial -----");
  initialise();
  var tutorialBox = document.getElementById("tutorial");
  tutorialBox.classList.add("tutorial-box-enabled");
  tutorialBox.innerHTML = " \
    <div class='tutorial-buttons'> \
      <button onclick='tutorial(-1)' class='choucas-btn' style='float:left;'>Précédent</button> \
      <button onclick='tutorial(1)' class='choucas-btn' style='float:right;'>Suivant</button> \
    </div> \
    <div id='tutorialHeader'>Tutorial</div> \
    <div id='tutorialText'></div>";
  tutorial(1);
}

var promptsStarted = false;

function tutorial(increment) {

  if(tutorialIndex == 1) {
    userName = document.getElementById("userName").value;
    ignKey = document.getElementById("ignKey").value;
    ignLogin = document.getElementById("ignLogin").value;
    itSkills = document.getElementById("itSkills").value;
    gisSkills = document.getElementById("gisSkills").value;
    choucasLog("Welcome Form:");
    choucasLog("userName: " + userName );
    choucasLog("itSkills: " + itSkills );
    choucasLog("gisSkills: " + gisSkills );
    choucasLog("ignKey: " + ignKey );
    choucasLog("ignLogin: " + ignLogin );

    //Set the map to IGN
    if(document.getElementById("ignKey").value != "") {
      document.getElementById("ignAPIKey").value = document.getElementById("ignKey").value
      document.getElementById("ignAPILogin").value = document.getElementById("ignLogin").value;
      document.getElementById("baseMapSelection").value = "IGN";
      loadBaseMap();
    }
  }

   if(tutorialIndex == 12) {
    sus1 = document.getElementById("sus1").value;
    sus2 = document.getElementById("sus2").value;
    sus3 = document.getElementById("sus3").value;
    sus4 = document.getElementById("sus4").value;
    sus5 = document.getElementById("sus5").value;
    sus6 = document.getElementById("sus6").value;
    sus7 = document.getElementById("sus7").value;
    sus8 = document.getElementById("sus8").value;
    sus9 = document.getElementById("sus9").value;
    sus10 = document.getElementById("sus10").value;
    questionReasoning = document.getElementById("questionReasoning").value;
    questionFeedback = document.getElementById("questionFeedback").value;
    choucasLog("Questionnaire Form:");
    choucasLog("sus1: " + sus1);
    choucasLog("sus2: " + sus2);
    choucasLog("sus3: " + sus3);
    choucasLog("sus4: " + sus4);
    choucasLog("sus5: " + sus5);
    choucasLog("sus6: " + sus6);
    choucasLog("sus7: " + sus7);
    choucasLog("sus8: " + sus8);
    choucasLog("sus9: " + sus9);
    choucasLog("sus10: " + sus10);
    choucasLog("questionReasoning: " + questionReasoning);
    choucasLog("questionFeedback: " + questionFeedback);
  }

  if(!experimentStarted && tutorialIndex == 9 && increment > 0) {
    if (! confirm("Cliquez sur OK pour commencer l'expérience, ou Cancel pour retourner au tutoriel") ) { return; }
    startLogSection("Experiment");
    choucasLog("----- Starting Experiment -----");
    clearManualZones();
    initialise();
    experimentStarted = true;
  }

  tutorialIndex += increment;
  choucasLog("ExperimentInstructions Step " + tutorialIndex + "/" + tutorialStepsSize);

  if(!promptsStarted && tutorialIndex == 3) {
    $("#promptBar").removeClass("hidden");
    enablePrompts();
    setPrompt(0);
    promptsStarted = true;
    promptsEnabled = true;
    document.getElementById("promptsEnabled").value = "Yes"
  }

  if (tutorialIndex <= 1) { tutorialIndex = 1; }
  if (tutorialIndex > tutorialStepsSize) {
    tutorialIndex = tutorialStepsSize;
  }

  document.getElementById("tutorialHeader").innerHTML = tutorialSteps[tutorialIndex]["TitleFR"];
  document.getElementById("tutorialText").innerHTML = tutorialSteps[tutorialIndex]["TextFR"];

  if(tutorialIndex == 1) {
    document.getElementById("userName").value = userName;
    document.getElementById("ignKey").value = ignKey;
    document.getElementById("ignLogin").value = ignLogin;
    document.getElementById("itSkills").value = itSkills;
    document.getElementById("gisSkills").value = gisSkills;
  }

  if(tutorialIndex == 12) {
    $("#tutorial").width(800)

    document.getElementById("sus1").value = sus1;
    document.getElementById("sus2").value = sus2;
    document.getElementById("sus3").value = sus3;
    document.getElementById("sus4").value = sus4;
    document.getElementById("sus5").value = sus5;
    document.getElementById("sus6").value = sus6;
    document.getElementById("sus7").value = sus7;
    document.getElementById("sus8").value = sus8;
    document.getElementById("sus9").value = sus9;
    document.getElementById("sus10").value = sus10;
    document.getElementById("questionReasoning").value = questionReasoning;
    document.getElementById("questionFeedback").value = questionFeedback;
  }
  else {
    $("#tutorial").width(450)
  }
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
// MANUAL ZONE FUNCTIONALITY
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

var drawnZoneColor = "rgba(0, 150, 0, ";
var drawingStyles = {
  "Point": new ol.style.Style({
             image: new ol.style.Circle({
               radius: 5,
               fill: new ol.style.Fill({
                 color: drawnZoneColor + " 1.0)"
               })
             })
           }),
  "LineString": new ol.style.Style({
                  stroke: new ol.style.Stroke({
                    color: drawnZoneColor + " 1.0)",
                    width: 3
                  })
                }),
  "Polygon": new ol.style.Style({
               fill: new ol.style.Fill({
                 color: drawnZoneColor + " 0.3)"
               })
             })
}

var selectedStyleFunction = function (feature, resolution) {
  var type = feature.getGeometry().getType();
  return drawingStyles[type];
}

var drawnPolygonStyle = new ol.style.Style({
                  stroke: new ol.style.Stroke({
                    color: drawnZoneColor + " 1.0)",
                    width: 5
                  }),
                  fill: new ol.style.Fill({
                    color: drawnZoneColor + " 0.3)"
                  })
                });

var drawnFeatures = [];
var manualSource = new ol.source.Vector();
manualSource.on('addfeature', function (event) {
  choucasLog("Manual Polygon Drawn");
  logManualZones();
    //var index = drawnFeatures.indexOf(event.feature);
    //if (index > -1) {
    //    drawnFeatures.splice(index, 1);
    //}
});

var manualLayer = new ol.layer.Vector({
  source: manualSource,
  style: drawnPolygonStyle
});


var draw, snap; // store the interactions so we can remove them later
function drawManualZone() {
  choucasLog("drawManualZone()");

  map.addLayer(manualLayer);
  var modify = new ol.interaction.Modify({source: manualSource});
  map.addInteraction(modify);

  draw = new ol.interaction.Draw({
    source: manualSource,
    type: "Polygon",
    style: selectedStyleFunction
  });

  //draw.on('drawend', function () {
  //  choucasLog("Manual Polygon Drawn");
  //  logManualZones();
  //});

  drawnFeatures = [];
  draw.on('drawend', function (event) {
    var tmpItem = event.feature.clone();
    tmpItem.getGeometry().transform("EPSG:3857", "EPSG:4326");
    drawnFeatures.push(format.writeFeatureObject(tmpItem));
  });

  map.addInteraction(draw);

  snap = new ol.interaction.Snap({source: manualSource});
  map.addInteraction(snap);

}

function confirmManualZone() {
  choucasLog("confirmManualZone()");
  map.removeInteraction(draw);
  map.removeInteraction(snap);
  logManualZones();
}

function clearManualZones() {
  choucasLog("cancelManualZone()");
  manualSource.clear();
  map.removeInteraction(draw);
  map.removeInteraction(snap);
  map.removeLayer(manualLayer);
}

function logManualZones() {
  var fc = turf.featureCollection(drawnFeatures);
  jsonStr = JSON.stringify(fc).slice(1, -1);
  choucasLog("Manual Zone: " + jsonStr);
  choucasLog("Final Manual Zone Size (km2):" ,turf.area(fc) / 1000000);
}

function logCalculatedZones() {
  var currentZoneFeatureCollection = turf.featureCollection(getZonesForAllScenarios());
  jsonStr = JSON.stringify(currentZoneFeatureCollection).slice(1, -1);
  choucasLog("Final Calculated Zone: " + jsonStr);
  $.each(currentZonesPerScenario, function(key, value) {
    if(value.length > 0) {
      var fc = turf.featureCollection(value)
      choucasLog("Final Calculated Zone Size (km2): Scenario " + key ,turf.area(fc) / 1000000);
    }
  });
}

function logFilter(filter) {
  //Update the selected items list for the current filter as this only usually gets saved when switching filter
  selectedItemsPerFilterConcise[selectedFilter] = getSelectedItemRefsConcise("#tree");

  var selectedNodesString = selectedItemsPerFilterConcise[filter].join(",");
  var bufferValue = document.getElementById("bufferInput" + filter).value;
  var distanceValue = document.getElementById("distanceInput" + filter).value;
  choucasLog("Filter Updated: " + filter + " Buffer=" + bufferValue + ", Distance=" + distanceValue + ", SelectedItems=" + selectedNodesString);
//  choucasLog("Filter Updated: " + filter + " Buffer=" + null + ", Distance=" + null + ", SelectedItems=" + selectedNodesString);
}


//-----------------------------------------------------------------------------
// Choucas Log
//-----------------------------------------------------------------------------
var logArray = [];
var logSection = "";
var logSectionStartTime = null;

function startLogSection(sectionName) {
  logSection = sectionName;
  logSectionStartTime = Date.now();
}

export function choucasLog(logText, value) {
  //To write all log statements to console as well as file enable the below statement
  console.log(logText + " " + value)
  value = value || "";
  logText = logText.replace(/(\r\n\t|\n|\r\t)/gm,"");
  logText = logText.replace(/\\\"/gm,"'");
  var elapsedSectionTime = (Date.now() - logSectionStartTime);
  logArray.push(logSection + "\t" + elapsedSectionTime + "\t" + logText + "\t" + value );
  //$.isArray(obj);
}

logArray.push("logSection\ttime\tlogText\tvalue");

startLogSection("Initialisation");

function outputLogToFile() {
  logCalculatedZones();
  logManualZones();

  var content = "";
  logArray.forEach(function(row){
    content += row + "\r\n";
  });

  //Output log file
  var d = new Date();
  var dateString = "" + d.getFullYear() + ("0"+(d.getMonth()+1)).slice(-2) + ("0" + d.getDate()).slice(-2) + "_" + d.getHours() + d.getMinutes() + d.getSeconds();
  var blob = new Blob([content], {type: "text/plain;charset=utf-8"});
  saveAs(blob, "choucas_experience_"+ dateString +".tsv");

  //Alternative file output method
  //let csvContent = "data:text/plain;charset=utf-8,";
  //let csvContent = "data:application/txt;charset=utf-8,";
  //var encodedUri = encodeURI(csvContent);
  //window.open(encodedUri);
}

