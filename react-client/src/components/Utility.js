    // Predefined arrays of adjectives and nouns for the random name generator
    const adjectives = ["Mighty", "Squishy", "Flamboyant", "Sporky", "Zesty", "Fuzzy", "Wacky", "Jolly",
        "Sparkling", "Giggly", "Peculiar", "Whimsical", "Silly", "Bubbly", "Quirky", "Lively", "Dazzling",
        "Cheeky", "Glittery", "Radiant", "Charming", "Playful", "Cozy", "Dapper", "Fancy", "Sassy", "Snazzy",
        "Witty", "Enchanting", "Dynamic", "Vibrant", "Clever", "Happy", "Funky", "Jovial", "Gleeful",
        "Sunny", "Bouncy", "Energetic", "Punny", "Dreamy", "Luminous", "Vivacious", "Zippy", "Merry", "Sprightly",];

    const nouns = ["Pickle",
        "Squirrel", "Unicorn", "Pancake", "Noodle", "Cupcake", "Rainbow", "Marshmallow", "Jellybean",
        "Bubble", "Cookie", "Snickerdoodle", "Doodle", "Muffin", "Pudding", "Gummy","Bear", "Cinnamon","Roll",
        "Sugarplum", "Sparkle", "Twinkle", "Starlight", "Dreamer", "Whisper", "Moonbeam", "Petal",
        "Sunshine", "Blossom", "Dazzle", "Harmony", "Melody", "Breeze", "Wonder", "Magic", "Fairy",
        "Sprite", "Pegasus", "Lullaby", "Serenade", "Comet", "Nova", "Galaxy", "Aurora", "Enchantment",
        "Bliss", "Jubilee", "Miracle", "Serendipity", "Charisma", "Fantasy", "Marvel",];

    export const profileiconames = [
        "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg",
            "11.jpg", "12.jpg", "13.jpg", "14.jpg", "15.jpg", "16.jpg", "17.jpg", "18.jpg"
    ]

    // Random Name Generator Function from the above defined names
    export const generateRandomName = () => {
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        return `${adjective} ${noun}`;
    };