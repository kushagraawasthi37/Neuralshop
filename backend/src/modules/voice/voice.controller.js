import { asyncHandler } from "../../utils/async-handler.js";
import ApiResponse from "../../utils/api-response.js";
import { callGroq } from "../../utils/groq.js";

const VALID_ACTIONS = [
  "navigate",
  "search",
  "add_to_cart",
  "remove_from_cart",
  "view_cart",
  "checkout",
  "view_orders",
  "view_wishlist",
  "view_profile",
  "filter_collection",
  "speak_info",
  "logout",
  "validation_error",
  "not_understood",
];

const buildSystemPrompt = (ctx) =>
  `
You are a voice assistant for NeuralShop, a luxury fashion e-commerce store.
Parse the user's spoken command and return a structured JSON action.

Current context:
- Page: ${ctx.page || "/"}
- Product open: ${ctx.productId ? `"${ctx.productName}" (id: ${ctx.productId})` : "none"}
- Cart item count: ${ctx.cartItemCount ?? 0}
- Cart is empty: ${ctx.isCartEmpty ?? true}
- Logged in: ${ctx.isLoggedIn ?? false}
- Available sizes on current product: ${ctx.availableSizes?.length ? ctx.availableSizes.join(", ") : "none"}
- Selected size: ${ctx.selectedSize || "none"}

You MUST return valid JSON with this exact structure:
{
  "action": "<one of: ${VALID_ACTIONS.join(" | ")}>",
  "params": {
    "route": "/path",
    "query": "search term",
    "category": "Apparel",
    "priceMax": 3000,
    "size": "M",
    "productName": "jacket name"
  },
  "speak": "Natural language response (max 25 words)",
  "requiresAction": true
}

Rules:
1. If user says "add to cart" but no product is open → action: "navigate", route: "/collections", speak: "Please open a product first, then I can add it to your cart."
2. If user says "add to cart" and a product is open but no size is selected and multiple sizes available → action: "validation_error", speak: "Please select a size first. Available sizes are ${ctx.availableSizes?.join(", ") || "shown on the product"}."
3. If user says "add to cart" and a product is open and only one size exists or size is already selected → action: "add_to_cart" with params.size
4. If user says "checkout" but cart is empty → action: "speak_info", speak: "Your cart is empty. Let me take you to the collection to browse."
5. If user says "checkout" but not logged in → action: "navigate", route: "/login?return=/checkout", speak: "You need to sign in first. Taking you to login."
6. For navigation: home → "/", cart → "/cart", orders → "/account/orders", wishlist → "/account/wishlist", profile → "/account/profile", collections → "/collections", about → "/about"
7. If user says "go back" or unclear page → action: "navigate", route to most logical page
8. Keep speak responses conversational and under 25 words
9. If completely unclear → action: "not_understood"
`.trim();

export const interpretVoice = asyncHandler(async (req, res) => {
  const { transcript, context = {} } = req.body;

  if (!transcript?.trim()) {
    return res.status(400).json({ message: "transcript is required" });
  }

  let result;
  try {
    const raw = await callGroq(
      [
        { role: "system", content: buildSystemPrompt(context) },
        { role: "user", content: transcript.trim() },
      ],
      //Controls randomness-> Temperature
      { temperature: 0.1, maxTokens: 400 },
    );
    result = JSON.parse(raw);
  } catch (err) {
    result = {
      action: "not_understood",
      params: {},
      speak: "Sorry, I didn't catch that. Please try again.",
      requiresAction: false,
    };
  }

  // Safety: ensure action is valid
  if (!VALID_ACTIONS.includes(result.action)) {
    result.action = "not_understood";
  }

  res.status(200).json(new ApiResponse(200, result, "ok"));
});
