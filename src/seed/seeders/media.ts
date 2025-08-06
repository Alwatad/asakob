import { logger } from "../utils/logger";

import type { Payload } from "payload";

type Asset = {
  filename: string;
  alt: string;
};

const ASSETS_DATA: Asset[] = [
  { filename: "logo.png", alt: "Company Logo" },
  { filename: "athletic-running-pro.jpg", alt: "Athletic Running Pro Shoes" },
  { filename: "athletic-training-flex.jpg", alt: "Athletic Training Flex Shoes" },
  { filename: "featured-bestseller.jpg", alt: "Featured Bestseller Shoes" },
  { filename: "hero-lifestyle.png", alt: "Hero Lifestyle Image" },
  { filename: "hero-running-shoes.png", alt: "Hero Running Shoes" },
  { filename: "mens-dress-oxford.jpg", alt: "Men's Dress Oxford Shoes" },
  { filename: "mens-sneaker-urban.jpg", alt: "Men's Urban Sneakers" },
  { filename: "womens-flat-comfort.jpg", alt: "Women's Comfort Flats" },
  { filename: "womens-heel-elegant.jpg", alt: "Women's Elegant Heels" },
];

export async function seedMedia(payload: Payload): Promise<Record<string, { id: string }>> {
  try {
    logger.info("📸 Creating media entries for existing Supabase Storage files...");

    const mediaAssets: Record<string, { id: string }> = {};

    for (const asset of ASSETS_DATA) {
      try {
        logger.info(`📄 Creating database entry for: ${asset.filename}`);

        // --- THE ONLY CHANGE IS HERE ---
        // Construct the URL using the correct S3-compatible path format.
        // The bucket name 'media' is assumed from your previous code.
        const fileUrl = `https://qlbmivkyeijvlktgitvk.supabase.co/storage/v1/media/${asset.filename}`;
        // --- END OF CHANGE ---

        const extension = asset.filename.split(".").pop()?.toLowerCase();
        const mimeType = extension === "png" ? "image/png" : "image/jpeg";

        // This `data` object now exactly matches your original structure, but with the corrected `fileUrl`.
        const media = (await payload.db.create({
          collection: "media",
          data: {
            alt: asset.alt,
            filename: asset.filename,
            mimeType: mimeType,
            filesize: 100000,
            width: 800,
            height: 600,
            url: fileUrl,
            thumbnailURL: fileUrl, // Kept your original schema field
            sizes: {
              thumbnail: {
                width: 400,
                height: 300,
                mimeType: mimeType,
                filesize: 50000,
                filename: `thumb_${asset.filename}`,
                url: fileUrl, // Kept this pointing to the main URL as in your original code
              },
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        })) as { id: string };

        mediaAssets[asset.filename] = { id: media.id };
        logger.success(`✅ Created media entry: ${asset.filename} → ID: ${media.id}`);
        logger.info(`   🔗 File URL: ${fileUrl}`);
      } catch (error) {
        logger.error(`❌ Failed to create media entry for ${asset.filename}:`);
        logger.error(`   Error: ${String(error)}`);

        if (error && typeof error === "object") {
          console.log("Full error object:", JSON.stringify(error, null, 2));
        }
      }
    }

    const successCount = Object.keys(mediaAssets).length;
    const totalCount = ASSETS_DATA.length;

    if (successCount === totalCount) {
      logger.success(`🎉 All media entries created successfully! (${successCount}/${totalCount})`);
    } else {
      logger.warn(`⚠️  Partial success: ${successCount}/${totalCount} media entries created`);
    }

    return mediaAssets;
  } catch (error) {
    logger.error("💥 Critical error in media seeding:", error);
    throw error;
  }
}
