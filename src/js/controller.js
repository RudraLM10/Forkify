import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

const recipeContainer = document.querySelector('.recipe');

if (module.hot) {
  module.hot.accept();
}

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    //0) Update results view to mark selected search results
    resultsView.update(model.getSearchResultsPage());

    //1)UPDATING BOOKMARKS VIEW
    bookmarksView.update(model.state.bookmarks);

    //2)Loading Recipe
    await model.loadRecipe(id);

    //3) Rendering Recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    //Get Search Query
    const query = searchView.getQuery();
    if (!query) return;

    //Load search results
    await model.loadSearchResults(query);

    //Render Results
    resultsView.render(model.getSearchResultsPage());

    //Render Pagination Buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  //RENDER NEW RESULTS
  resultsView.render(model.getSearchResultsPage(goToPage));

  //RENDER NEW PAGINATION BUTTONS
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //ADD/REMOVE BOOKMARKS
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //UPDATE RECIPE VIEW
  recipeView.update(model.state.recipe);

  //RENDER BOOKMARKS
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //SHOW LOADING SPINNER
    addRecipeView.renderSpinner();

    //UPLOAD NEW RECIPE DATA
    await model.uploadRecipe(newRecipe);

    //RENDER RECIPE
    recipeView.render(model.state.recipe);

    //SUCESS MESSAGE
    addRecipeView.renderMessage();

    //RENDER BOOKMARK VIEW
    bookmarksView.render(model.state.bookmarks);

    //CHANGE ID IN URL
    window.history.pushState(null,'',`#${model.state.recipe.id}`)

    //CLOSE FORM WINDOW
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('$', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
