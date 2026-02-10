# MixBoard

## Vision
MixBoard is a consumer web app that lets users generate images from multiple AI models simultaneously, pick the best elements from each result, and synthesize them into one final cohesive image. It's "Perplexity Model Council" for AI image generation.

## Goals
- Enable multi-model AI image generation from a single prompt
- Provide an intuitive element selection interface (composition, colors, subject, style, background)
- Use AI to synthesize selected elements into one coherent final image
- Deliver a polished, mobile-first creative tool experience

## Target Audience
Creative professionals, designers, and AI art enthusiasts who want more control over AI-generated images by combining the best aspects of multiple generation approaches.

## Scope
### Included
- Text-to-image generation via 3 style variants (Gemini API)
- Side-by-side image comparison
- 5-category element selection
- AI-powered image synthesis
- User accounts with credit system
- Mix history dashboard
- Before/after comparison slider

### Explicitly Excluded
- Image editing/inpainting tools
- Region-based mask selection
- Social features / public gallery
- Admin dashboard
- Email notifications
- Full Stripe payment integration (scaffolded only)

## Success Criteria
- Users can complete the full generate → select → mix workflow
- Results are visually coherent (not collages)
- Page loads under 3 seconds
- Mobile-responsive on all screens
