import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const response = await fetch(`https://satellitemap.space/sat/${id}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            next: { revalidate: 300 } // Cache for 5 minutes
        });

        if (!response.ok) {
            throw new Error('Failed to fetch page');
        }

        const html = await response.text();

        // Helper to extract value based on label
        const extract = (label: string): string => {
            // Look for the label, then find the value in the following markup
            // Pattern typically: <div>Label</div>...<div>Value</div> or similar
            // We'll use a loose regex to find the label and grab text after it
            // This is brittle but works for simple server-rendered pages
            const regex = new RegExp(`${label}[^<]*<\\/div>\\s*<div[^>]*>([^<]+)<`, 'i');
            // Alternative for table-like structures often found in these sites:
            // Label... Value
            // Let's try to match the label and capturing the next relevant text content
            // Note: The HTML structure analysis showed standard classes might be missing, 
            // simple searching for the label and taking the next non-empty string might work better.

            // Based on typical scraping:
            // Find label, look ahead for value. 
            // Let's rely on the specific screenshot structure which looks like a grid.
            // "Mass" .... "575.00 kg"

            // Simple string index finding
            const labelIndex = html.indexOf(label);
            if (labelIndex === -1) return 'N/A';

            // Look forward from label for the value
            // Usually separated by tags. 
            const slice = html.slice(labelIndex);
            // Find the next significant text after the label's closing tag
            const match = slice.match(/<\/div>\s*<div[^>]*>\s*([^<]+)\s*<\/div>/);
            if (match && match[1]) return match[1].trim();

            // Fallback: try different structure (table row)
            const matchTable = slice.match(/<td[^>]*>\s*([^<]+)\s*<\/td>/);
            if (matchTable && matchTable[1]) return matchTable[1].trim();

            return 'N/A';
        };

        // More robust extraction for specific known format from screenshot
        // The screenshot shows keys on left, values on right. Likely flex or grid.
        // "Mass" -> "575.00 kg"
        // Let's try a regex that looks for the label, some intervening tags, and then the value.
        const extractRobust = (label: string) => {
            // Matches: Label <...tags...> Value <
            const regex = new RegExp(`${label}[\\s\\S]*?>\\s*([^<\\n]+)\\s*<`, 'i');
            const match = html.match(regex);
            return match ? match[1].trim() : '?';
        };

        // Extract Technical Details (from Screenshot 1)
        const mass = extractRobust('Total Mass'); // or just 'Mass'
        const dims = extractRobust('Dimensions'); // or Length/Diameter if separate
        const manufacturer = extractRobust('Manufacturer');
        const busType = extractRobust('Bus Type');

        // Extract Status (from Screenshot 2)
        const altitude = extractRobust('Altitude');
        const velocity = extractRobust('Velocity');
        const launchDate = extractRobust('Launch Date');

        // fallback if regex is too loose, we clean up
        const clean = (s: string) => s.replace(/&nbsp;/g, ' ').trim();

        return NextResponse.json({
            id,
            technical: {
                mass: clean(mass),
                manufacturer: clean(manufacturer),
                busType: clean(busType),
            },
            status: {
                altitude: clean(altitude),
                velocity: clean(velocity),
                launchDate: clean(launchDate),
            }
        });

    } catch (error) {
        console.error('Scraping error:', error);
        return NextResponse.json({ error: 'Failed to fetch satellite info' }, { status: 500 });
    }
}
