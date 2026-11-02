# Kidtivity Learn: бриф на картинки и иконки

Три набора, в порядке приоритета:

- **A.** 35 картинок навыков. Заменяют эмодзи на карточках заданий.
- **B.** 14 иконок интерфейса. Острова, огонёк серии, герои, звук, реакции «как тебе было».
- **C.** 55 картинок предметов внутри заданий. Это потом, отдельной партией.

## Стиль (общий для всех трёх наборов)

Тот же стиль, что у текущих иконок (кубики 1-2-3, книга, пазл, лампочка, монетка, звезда): объёмная «пластилиновая» игрушка, глянец, мягкий свет.

Добавлять в конец каждого промпта:

> 3D clay-style toy icon, soft rounded shapes, glossy plastic finish, bright saturated colors, soft studio lighting, subtle contact shadow, centered, isolated on a transparent background, no text, kid-friendly, consistent icon set

## Технические требования

- PNG, квадрат 1:1, 1024×1024, прозрачный фон. Если прозрачность не получается, подойдёт ровный однотонный светлый фон.
- Предмет занимает 80–85% кадра, ничего не обрезано.
- Никакого текста. Исключение: одиночные крупные буквы или цифры там, где они указаны в промпте. Проверяй, что буква или цифра правильная, генераторы часто их искажают.
- Имя файла = `id` из таблицы.
- Складывать в `/Users/denis/Documents/Claude/Projects/kidtivitylab/_new-art/` по папкам `skills/`, `ui/`, `objects/`.

## A. Картинки навыков (35)

### Math

| id | Навык | Промпт |
|---|---|---|
| `count` | Counting | five shiny red apples lined up in a neat row, a tiny pointing finger touching the first one |
| `compare` | Bigger or smaller | a cute green toy alligator with its mouth wide open toward a bigger pile of candies, a small pile behind it |
| `sequence6` | Number line | a wooden toy number line with colorful beads, a small green frog hopping along it |
| `add6` | Addition | a chunky glossy orange plus sign with two small groups of ladybugs walking toward each other |
| `sub6` | Subtraction | a plate of cookies with one cookie being lifted away by a small hand, a few crumbs, a chunky blue minus sign |
| `shapes6` | Shapes | chunky toy shapes stacked playfully: red circle, blue square, yellow triangle, purple star |

### Reading

| id | Навык | Промпт |
|---|---|---|
| `firstLetter` | First letter | a big glossy letter block "A" next to a shiny red apple |
| `syllables6` | Syllables | two small cartoon hands clapping, with colorful rhythm sparkles around them |
| `readWord` | Reading words | an open picture book with a picture card of a cute cat popping out of the pages |
| `missingLetter` | Missing letter | three wooden letter tiles in a row, the middle tile missing, a glowing question-mark tile floating above the gap |
| `readSentence6` | Reading sentences | an unrolled paper scroll with abstract squiggle lines (no real letters) and a small magnifying glass |
| `stories6` | Stories and retelling | a stack of three colorful storybooks, a little paper boat and a star rising out of the top book |

### Words & sounds

| id | Навык | Промпт |
|---|---|---|
| `enWords6` | First words | a rounded speech bubble with a shiny red apple inside |
| `enListen6` | Listening | kid-size bright headphones with soft sound waves coming out |
| `enColors6` | Colors | a paint palette with bright paint blobs (red, yellow, blue, green) and a small brush |
| `enNumbers6` | Numbers | a speech bubble with a chunky number "3" inside |
| `enLetters6` | ABC letters | three alphabet blocks "A", "B", "C" stacked in a small tower |

### Logic & memory

| id | Навык | Промпт |
|---|---|---|
| `patterns6` | Patterns | a string of chunky beads in a repeating pattern: red, blue, red, blue, red |
| `oddOne6` | Odd one out | three yellow rubber ducks and one small blue penguin standing in a row |
| `memory6` | Memory | four face-down memory cards and one card flipped over showing a yellow star |
| `calendar6` | Days, months, seasons | a cute desk calendar surrounded by four tiny season symbols: snowflake, tulip, sun, autumn leaf |

### Extra challenge

| id | Навык | Промпт |
|---|---|---|
| `add2d` | Adding two-digit numbers | base-ten blocks: two long ten-rods and a few unit cubes joined by a chunky plus sign |
| `sub2d` | Subtracting two-digit numbers | base-ten blocks with a few unit cubes sliding away, a chunky minus sign |
| `geo6` | Geometry challenge | 3D geometric solids in pastel colors: cube, cone, cylinder, sphere, pyramid |
| `add100` | Adding to 100 | a shiny gold medal with the number "100" on a ribbon |
| `tensOnes` | Tens and ones | base-ten blocks: three long ten-rods and four small unit cubes side by side |
| `missingNum6` | Missing number | a row of three number tiles with one empty glowing slot in the middle |
| `groups6` | Groups (times) | three small plates, each holding two cookies |
| `skipCount6` | Skip counting | a cheerful kangaroo hopping across colorful stepping stones |
| `clock6` | Clocks: hands and digits | a cute analog alarm clock with a friendly face and two bells on top |
| `problems6` | Story problems | an open notebook with a little bird doodle, a pencil, and a thought bubble with a question mark |
| `sudoku6` | Mini sudoku | a small 4x4 wooden board with colorful fruit pieces in some of the squares |
| `balance6` | Balance scales | a toy balance scale with colorful blocks on both pans, perfectly level |
| `analogies6` | Analogies | a bee and a honey pot joined by a glowing chain link |

## B. Иконки интерфейса (14)

| id | Где используется | Промпт |
|---|---|---|
| `words-abc` | остров Words & sounds, вместо глобуса с британским автобусом | a speech bubble with three small alphabet blocks inside |
| `streak-flame` | серия дней | a cute smiling flame, warm orange and yellow |
| `heroes` | кнопка «Мои герои» | a small red superhero cape with a gold star emblem |
| `parents` | раздел для родителей | a cozy little house with a heart on the door |
| `sound-on` | звук включён | a glossy speaker with soft sound waves |
| `sound-off` | звук выключен | a glossy speaker with a small "x" instead of waves |
| `focus` | метка «в фокусе» | a target board with an arrow in the bullseye |
| `level-check` | кнопка «проверка уровня» | a magnifying glass with a small star in the lens |
| `lock` | закрытый герой | a chunky golden padlock |
| `trophy` | все герои собраны | a shiny gold trophy cup with a star |
| `feel-easy` | «Легко» после раунда | a round smiley face, relaxed and calm, eyes closed, gentle smile, mint green |
| `feel-ok` | «Нормально» | a round smiley face with a happy smile, sunny yellow |
| `feel-hard` | «Сложно» | a round face with a wobbly, effortful expression (not sad or crying), soft coral |
| `new-badge` | бейдж «Новое» | a small sparkling burst star, bright green |

Ещё одно: на главной картинке приложения (`hero-1600.webp`) есть остров с британским флагом, Биг-Беном и красным автобусом. Для американской аудитории его лучше перерисовать, например на остров с пузырём речи и кубиками ABC.

## C. Предметы внутри заданий (55, второй этап)

Сейчас в заданиях около 200 разных эмодзи. Цветные кружки и фигуры останутся как есть. Для начала стоит заменить предметы, которые ребёнок видит чаще всего: 45 слов словаря, на них построены 8 навыков чтения и слов, и 10 предметов для счёта.

**Словарь (45):** apple, cat, dog, house, sun, fish, tree, car, elephant, banana, bear, fox, frog, watermelon, carrot, mouse, owl, moon, star, bee, duck, cow, pear, cheese, wolf, balloon, ball, turtle, giraffe, snake, grapes, rabbit, rooster, train, milk, lemon, penguin, lion, tiger, pig, horse, bread, book, pencil, flower.

**Счёт (10, часть совпадает со словарём):** star, flower, ladybug, balloon, chick, strawberry, ball, apple, fish, cookie.

Промпт: `a single cute <предмет>, simple and instantly recognizable` плюс общий стиль. Имя файла: `objects/<слово>.png`, например `objects/apple.png`.
