import models from '../database/models';
import filterMostUpvotedRecipes from './../filters/mostUpvoted';
import filterMostFavoritedRecipes from './../filters/mostFavorited';

/**
 * Controller to handle all recipe endpoint routes
 */
export default class RecipesController {
  /**
   * Return a list of all recipes
   * @param {object} req express request object
   * @param {object} res express response object
   * @returns {json} json
   * @memberof RecipesController
   */
  async index(req, res) {
    const {
      query, page, perPage, sort
    } = req.query;

    const getMetaData = recipesMeta => ({
      paginationMeta: {
        currentPage: Number(page) || 1,
        recipesCount: recipesMeta.count,
        pageCount: Math.ceil(recipesMeta.count / (perPage || 2))
      },
      recipes: recipesMeta.rows
    });

    if (sort === 'mostFavorited' && !query) {
      const recipesMeta = await filterMostFavoritedRecipes(page || 1, perPage || 3);

      return res.sendSuccessResponse({ recipes: getMetaData(recipesMeta) }, 200);
    }

    if (sort === 'mostUpvoted' && !query) {
      const recipesMeta = await filterMostUpvotedRecipes(page || 1, perPage || 3);

      return res.sendSuccessResponse({ recipes: getMetaData(recipesMeta) }, 200);
    }

    const dbQuery = {
      include: {
        model: models.User,
        attributes: { exclude: ['password'] }
      },
      limit: perPage || 2,
      offset: (perPage || 2) * ((page || 1) - 1)
    };

    if (query) {
      dbQuery.where = {
        title: {
          $iLike: `%${query}%`
        }
      };
    }

    if (sort === 'date') {
      dbQuery.order = [
        ['createdAt', 'DESC']
      ];
    }

    const recipesMeta = await models.Recipe.findAndCountAll(dbQuery);

    return res.sendSuccessResponse({ recipes: getMetaData(recipesMeta) }, 200);
  }

  /**
   * Find a specific recipe
   *
   * @param {obj} req express request object
   * @param {any} res express response object
   * @returns {json} recipe
   * @memberof RecipesController
   */
  async find(req, res) {
    const recipe = req.currentRecipe;

    return res.sendSuccessResponse({ recipe });
  }

  /**
   * Store a new recipe into the database
   * @param {object} req express request object
   * @param {object} res express response object
   * @returns {json} json of newly created recipe
   * @memberof RecipesController
   */
  async create(req, res) {
    const reqBody = req.body;
    const createdRecipe = await models.Recipe.create({
      title: reqBody.title,
      description: reqBody.description,
      imageUrl: reqBody.imageUrl,
      timeToCook: reqBody.timeToCook,
      ingredients: reqBody.ingredients,
      procedure: reqBody.procedure,
      userId: req.authUser.id
    });

    const recipe = await models.Recipe.findById(createdRecipe.id, {
      include: {
        model: models.User,
        attributes: { exclude: ['password'] }
      }
    });

    return res.sendSuccessResponse({ recipe }, 201);
  }


  /**
   * Update a recipe in storage
   * @param {object} req express request object
   * @param {object} res express response object
   * @returns {json} json with updated recipe
   * @memberof RecipesController
   */
  async update(req, res) {
    const recipe = req.currentRecipe;
    const reqBody = req.body;

    await recipe.update({
      title: reqBody.title || recipe.title,
      description: reqBody.description || recipe.description,
      imageUrl: reqBody.imageUrl || recipe.imageUrl,
      timeToCook: reqBody.timeToCook || recipe.timeToCook,
      ingredients: reqBody.ingredients || recipe.ingredients,
      procedure: reqBody.procedure || recipe.procedure
    });

    const updatedRecipe = await models.Recipe.findById(recipe.id, {
      include: {
        model: models.User,
        attributes: { exclude: ['password'] }
      }
    });

    return res.sendSuccessResponse(updatedRecipe, 200);
  }


  /**
   * Delete a recipe from the database
   * @param {any} req express request object
   * @param {any} res express response object
   * @returns {json} confirmation message
   * @memberof RecipesController
   */
  async destroy(req, res) {
    await req.currentRecipe.destroy();
    return res.sendSuccessResponse({ message: 'Recipe deleted.' });
  }
}
