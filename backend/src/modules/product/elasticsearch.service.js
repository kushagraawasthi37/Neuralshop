import createElasticsearchClient from "../../config/elasticsearch.js";

const getClient = async () => {
  return await createElasticsearchClient();
};

const PRODUCT_INDEX = "products";

export const createProductIndex = async () => {
  try {
    const elasticsearchClient = await getClient();
    const exists = await elasticsearchClient.indices.exists({
      index: PRODUCT_INDEX,
    });
    if (!exists) {
      await elasticsearchClient.indices.create({
        index: PRODUCT_INDEX,

        mappings: {
          properties: {
            name: { type: "text", analyzer: "standard" },
            description: { type: "text", analyzer: "standard" },
            category: { type: "keyword" },
            subCategory: { type: "keyword" },
            price: { type: "float" },
            rating: { type: "float" },
            reviewCount: { type: "integer" },
            bestseller: { type: "boolean" },
            tags: { type: "keyword" },
            owner: { type: "keyword" },
            createdAt: { type: "date" },
            updatedAt: { type: "date" },
          },
        },
      });
      console.log("Product index created");
    }
  } catch (error) {
    console.error("Error creating product index:", error);
  }
};

// DB → Elasticsearch sync
export const indexProduct = async (product) => {
  try {
    const elasticsearchClient = await getClient();
    await elasticsearchClient.index({
      index: PRODUCT_INDEX,
      id: product._id.toString(),
      body: {
        name: product.name,
        description: product.description,
        category: product.category,
        subCategory: product.subCategory,
        price: product.price,
        rating: product.rating,
        reviewCount: product.reviewCount,
        bestseller: product.bestseller,
        tags: product.tags,
        owner: product.owner.toString(),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error indexing product:", error);
  }
};

export const updateProductIndex = async (productId, updateData) => {
  try {
    const elasticsearchClient = await getClient();
    await elasticsearchClient.update({
      index: PRODUCT_INDEX,
      id: productId,
      doc: updateData,
      doc_as_upsert: true,
      retry_on_conflict: 5,
    });
  } catch (error) {
    console.error("Error updating product index:", error);
  }
};

export const deleteProductIndex = async (productId) => {
  try {
    const elasticsearchClient = await getClient();
    await elasticsearchClient.delete({
      index: PRODUCT_INDEX,
      id: productId,
    });
  } catch (error) {
    console.error("Error deleting product from index:", error);
  }
};

export const searchProducts = async (
  query,
  filters,
  sort,
  page = 1,
  limit = 10,
) => {
  try {
    const elasticsearchClient = await getClient();
    const body = {
      query: {
        bool: {
          must: [],
          filter: [],
        },
      },
      sort: [],
      from: (page - 1) * limit,
      size: limit,
    };

    // Search query with fuzzy matching
    if (query) {
      body.query.bool.must.push({
        multi_match: {
          query,
          fields: [
            "name^3",
            "description^2",
            "category",
            "subCategory",
            "tags",
          ],
          fuzziness: "AUTO", // Enables fuzzy search for approximate matches
          prefix_length: 2, // Don't fuzz the first 2 characters
        },
      });
    }

    // Filters
    if (filters.category) {
      body.query.bool.filter.push({
        term: { category: filters.category },
      });
    }

    if (filters.subCategory) {
      body.query.bool.filter.push({
        term: { subCategory: filters.subCategory },
      });
    }

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      const range = {};
      if (filters.priceMin !== undefined) range.gte = filters.priceMin;
      if (filters.priceMax !== undefined) range.lte = filters.priceMax;
      body.query.bool.filter.push({
        range: { price: range },
      });
    }

    if (filters.ratingMin !== undefined) {
      body.query.bool.filter.push({
        range: { rating: { gte: filters.ratingMin } },
      });
    }

    if (filters.bestseller !== undefined) {
      body.query.bool.filter.push({
        term: { bestseller: filters.bestseller },
      });
    }

    // Sorting
    if (sort) {
      if (sort === "price_asc") {
        body.sort.push({ price: { order: "asc" } });
      } else if (sort === "price_desc") {
        body.sort.push({ price: { order: "desc" } });
      } else if (sort === "newest" || sort === "createdAt_desc") {
        body.sort.push({ createdAt: { order: "desc" } });
      } else if (sort === "createdAt_asc") {
        body.sort.push({ createdAt: { order: "asc" } });
      } else if (sort === "rating" || sort === "rating_desc") {
        body.sort.push({ rating: { order: "desc" } });
      } else if (sort === "name_asc") {
        body.sort.push({ name: { order: "asc" } });
      } else if (sort === "name_desc") {
        body.sort.push({ name: { order: "desc" } });
      }
    } else {
      body.sort.push({ _score: { order: "desc" } });
    }

    const result = await elasticsearchClient.search({
      index: PRODUCT_INDEX,
      body,
    });

    return {
      products: result.hits.hits.map((hit) => ({
        ...hit._source,
        _id: hit._id,
      })),
      total: result.hits.total.value,
      page,
      limit,
    };
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
};
