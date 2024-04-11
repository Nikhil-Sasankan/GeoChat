    // Predefined arrays of adjectives and nouns for the random name generator
    const adjectives = ["Mighty", "Squishy", "Flamboyant", "Sporky", "Zesty", "Fuzzy", "Wacky", "Jolly",
        "Sparkling", "Giggly", "Peculiar", "Whimsical", "Silly", "Bubbly", "Quirky", "Lively", "Dazzling",
        "Cheeky", "Glittery", "Radiant", "Charming", "Playful", "Cozy", "Dapper", "Fancy", "Sassy", "Snazzy",
        "Witty", "Enchanting", "Dynamic", "Vibrant", "Clever", "Happy-go-lucky", "Funky", "Jovial", "Gleeful",
        "Sunny", "Bouncy", "Energetic", "Punny", "Dreamy", "Luminous", "Vivacious", "Zippy", "Merry", "Sprightly",];

    const nouns = ["Pickle",
        "Squirrel", "Unicorn", "Pancake", "Noodle", "Cupcake", "Rainbow", "Marshmallow", "Jellybean",
        "Bubble", "Cookie", "Snickerdoodle", "Doodle", "Muffin", "Pudding", "Gummy Bear", "Cinnamon Roll",
        "Sugarplum", "Sparkle", "Twinkle", "Starlight", "Dreamer", "Whisper", "Moonbeam", "Petal",
        "Sunshine", "Blossom", "Dazzle", "Harmony", "Melody", "Breeze", "Wonder", "Magic", "Fairy",
        "Sprite", "Pegasus", "Lullaby", "Serenade", "Comet", "Nova", "Galaxy", "Aurora", "Enchantment",
        "Bliss", "Jubilee", "Miracle", "Serendipity", "Charisma", "Fantasy", "Marvel",];


    // Random Name Generator Function from the above defined names
    export const generateRandomName = () => {
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        return `${adjective} ${noun}`;
    };