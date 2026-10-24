import { l, type Lang } from "../i18n";
import { type Skill, pick, options, shuffle, speechLang } from "../engine";
import { BASIC_WORDS } from "./words";

const ALPHABET: Record<Lang, string> = {
  uk: "абвгґдеєжзиіїклмнопрстуфхцчшщюя",
  ru: "абвгдеёжзиклмнопрстуфхцчшщэюя",
  en: "abcdefghijklmnopqrstuvwxyz",
};
const up = (s: string) => s.toLocaleUpperCase();

const P = {
  firstLetter: l("З якої літери починається слово?", "С какой буквы начинается слово?", "Which letter does the word start with?"),
  readWord: l("Прочитай слово і знайди малюнок", "Прочитай слово и найди картинку", "Read the word and find the picture"),
  missing: l("Якої літери не вистачає?", "Какой буквы не хватает?", "Which letter is missing?"),
  spelling: l("Яке слово написане правильно?", "Какое слово написано правильно?", "Which word is spelled correctly?"),
  antonym: l("Добери слово з протилежним значенням", "Подбери слово с противоположным значением", "Pick the word with the opposite meaning"),
};

// ---------- spelling (11) ----------
const SPELLING: Record<Lang, string[][]> = {
  uk: [
    ["м'ясо", "мясо", "мьясо"],
    ["п'ятниця", "пятниця", "пьятниця"],
    ["здоров'я", "здоровя", "здоровья"],
    ["комп'ютер", "компютер", "компьютер"],
    ["подвір'я", "подвіря", "подвірья"],
    ["сьогодні", "сьогодни", "сегодні"],
    ["бджола", "бжола", "джола"],
    ["легкий", "лехкий", "легкій"],
    ["вокзал", "вагзал", "вокзаль"],
    ["шістнадцять", "шіснадцять", "шістнацять"],
    ["проїзний", "проізний", "проїздний"],
    ["вісімдесят", "вісімдесять", "вісемдесят"],
    ["черешня", "чирешня", "черешьня"],
    ["щасливий", "щастливий", "щасливій"],
    ["кросівки", "красівки", "кросовки"],
    ["ананас", "ананнас", "онанас"],
    ["українська", "україньска", "украінська"],
    ["дзвоник", "звоник", "дзвонік"],
    ["молодець", "малодець", "молодеть"],
    ["шоколад", "шеколад", "шоколат"],
  ],
  ru: [
    ["корова", "карова", "коровва"],
    ["молоко", "малоко", "молако"],
    ["собака", "сабака", "собакка"],
    ["лестница", "лесница", "лесчница"],
    ["солнце", "сонце", "солнци"],
    ["чувство", "чуство", "чюство"],
    ["праздник", "празник", "праздьник"],
    ["здравствуйте", "здраствуйте", "здравствуте"],
    ["интересный", "интерестный", "интиресный"],
    ["расчёска", "росчёска", "расчоска"],
    ["жёлтый", "жолтый", "жёлтий"],
    ["шоссе", "шосе", "шоссэ"],
    ["вокзал", "вагзал", "вогзал"],
    ["аккуратный", "акуратный", "аккурратный"],
    ["грамматика", "граматика", "грамматтика"],
    ["сегодня", "севодня", "сиводня"],
    ["учитель", "учитиль", "учетель"],
    ["пожалуйста", "пожалуста", "пожайлуста"],
    ["шоколад", "шеколад", "шоколат"],
    ["лёгкий", "лёхкий", "лёкий"],
  ],
  en: [
    ["because", "becose", "becaus"],
    ["friend", "freind", "frend"],
    ["beautiful", "beatiful", "beautifull"],
    ["necessary", "neccessary", "necesary"],
    ["tomorrow", "tommorow", "tomorow"],
    ["Wednesday", "Wensday", "Wednsday"],
    ["receive", "recieve", "receeve"],
    ["different", "diffrent", "diferent"],
    ["separate", "seperate", "separete"],
    ["library", "libary", "libery"],
    ["February", "Febuary", "Februery"],
    ["believe", "beleive", "belive"],
    ["surprise", "suprise", "surprize"],
    ["school", "scool", "shool"],
    ["answer", "anser", "answar"],
    ["island", "iland", "islend"],
    ["knowledge", "knowlege", "nowledge"],
    ["address", "adress", "addres"],
    ["favorite", "favrite", "favorit"],
    ["business", "buisness", "bussiness"],
  ],
};

// ---------- antonyms (11) ----------
const ANTONYMS: Record<Lang, [string, string][]> = {
  uk: [
    ["великий", "маленький"], ["день", "ніч"], ["гарячий", "холодний"], ["високий", "низький"],
    ["швидкий", "повільний"], ["веселий", "сумний"], ["старий", "молодий"], ["світлий", "темний"],
    ["легкий", "важкий"], ["широкий", "вузький"], ["сильний", "слабкий"], ["рано", "пізно"],
    ["вгорі", "внизу"], ["початок", "кінець"], ["друг", "ворог"], ["правда", "неправда"],
    ["сміливий", "боязкий"], ["щедрий", "жадібний"], ["чистий", "брудний"], ["голосно", "тихо"],
  ],
  ru: [
    ["большой", "маленький"], ["день", "ночь"], ["горячий", "холодный"], ["высокий", "низкий"],
    ["быстрый", "медленный"], ["весёлый", "грустный"], ["старый", "молодой"], ["светлый", "тёмный"],
    ["лёгкий", "тяжёлый"], ["широкий", "узкий"], ["сильный", "слабый"], ["рано", "поздно"],
    ["вверху", "внизу"], ["начало", "конец"], ["друг", "враг"], ["правда", "ложь"],
    ["смелый", "трусливый"], ["щедрый", "жадный"], ["чистый", "грязный"], ["громко", "тихо"],
  ],
  en: [
    ["big", "small"], ["day", "night"], ["hot", "cold"], ["high", "low"],
    ["fast", "slow"], ["happy", "sad"], ["old", "young"], ["bright", "dark"],
    ["light", "heavy"], ["wide", "narrow"], ["strong", "weak"], ["early", "late"],
    ["up", "down"], ["start", "end"], ["friend", "enemy"], ["truth", "lie"],
    ["brave", "cowardly"], ["generous", "greedy"], ["clean", "dirty"], ["loud", "quiet"],
  ],
};

// ---------- reading (11) ----------
type Text = { text: string; qs: { q: string; a: string[] }[] };
const TEXTS: Record<Lang, Text[]> = {
  uk: [
    {
      text: "Щоранку Олена поливає квіти на балконі. Найбільше вона любить червоні тюльпани, бо їх посадила бабуся. Одного дня Олена помітила, що один тюльпан зів'яв. Вона пересадила його в більший горщик, і за тиждень квітка знову ожила.",
      qs: [
        { q: "Що Олена робить щоранку?", a: ["поливає квіти", "годує кота", "читає книжку", "йде до школи"] },
        { q: "Хто посадив тюльпани?", a: ["бабуся", "мама", "Олена", "тато"] },
        { q: "Що допомогло квітці?", a: ["більший горщик", "нове добриво", "сонячне світло", "холодна вода"] },
      ],
    },
    {
      text: "Андрій вирішив зробити годівничку для птахів. Він узяв порожню коробку з-під соку, вирізав у ній віконце і прив'язав до гілки яблуні. Першими прилетіли синички. Наступного дня до годівнички завітав дятел, але насіння йому не сподобалося.",
      qs: [
        { q: "З чого Андрій зробив годівничку?", a: ["з коробки з-під соку", "з дерев'яних дощок", "з пластикової пляшки", "з паперового пакета"] },
        { q: "Хто прилетів першим?", a: ["синички", "горобці", "дятел", "голуби"] },
        { q: "На якому дереві висіла годівничка?", a: ["на яблуні", "на дубі", "на груші", "на липі"] },
      ],
    },
    {
      text: "У класі вирішили провести ярмарок. Кожен учень приніс щось своє: хтось спік печиво, хтось зробив браслети. Софійка намалювала листівки і продала всі десять. Усі гроші клас віддав на корм для тварин у притулку.",
      qs: [
        { q: "Що зробила Софійка?", a: ["намалювала листівки", "спекла печиво", "сплела браслети", "зробила іграшки"] },
        { q: "Скільки листівок продала Софійка?", a: ["десять", "п'ять", "дві", "двадцять"] },
        { q: "На що клас віддав гроші?", a: ["на корм для тварин", "на нові книжки", "на екскурсію", "на подарунок учительці"] },
      ],
    },
    {
      text: "Дмитро прокинувся й подивився у вікно: дахи будинків були білі, а діти на вулиці ліпили сніговика. Він швидко вдягнув теплу куртку, шапку й рукавиці. Мама нагадала, що о дев'ятій починаються уроки, тому погуляти можна лише пів години.",
      qs: [
        { q: "Яка зараз пора року?", a: ["зима", "осінь", "весна", "літо"] },
        { q: "Що робили діти на вулиці?", a: ["ліпили сніговика", "каталися на велосипедах", "грали у футбол", "збирали листя"] },
        { q: "Скільки часу Дмитро може гуляти?", a: ["пів години", "годину", "дві години", "цілий день"] },
      ],
    },
  ],
  ru: [
    {
      text: "Каждое утро Лена поливает цветы на балконе. Больше всего она любит красные тюльпаны, потому что их посадила бабушка. Однажды Лена заметила, что один тюльпан завял. Она пересадила его в горшок побольше, и через неделю цветок снова ожил.",
      qs: [
        { q: "Что Лена делает каждое утро?", a: ["поливает цветы", "кормит кота", "читает книгу", "идёт в школу"] },
        { q: "Кто посадил тюльпаны?", a: ["бабушка", "мама", "Лена", "папа"] },
        { q: "Что помогло цветку?", a: ["горшок побольше", "новое удобрение", "солнечный свет", "холодная вода"] },
      ],
    },
    {
      text: "Андрей решил сделать кормушку для птиц. Он взял пустую коробку из-под сока, вырезал в ней окошко и привязал к ветке яблони. Первыми прилетели синицы. На следующий день к кормушке заглянул дятел, но семечки ему не понравились.",
      qs: [
        { q: "Из чего Андрей сделал кормушку?", a: ["из коробки из-под сока", "из деревянных досок", "из пластиковой бутылки", "из бумажного пакета"] },
        { q: "Кто прилетел первым?", a: ["синицы", "воробьи", "дятел", "голуби"] },
        { q: "На каком дереве висела кормушка?", a: ["на яблоне", "на дубе", "на груше", "на липе"] },
      ],
    },
    {
      text: "В классе решили устроить ярмарку. Каждый ученик принёс что-то своё: кто-то испёк печенье, кто-то сделал браслеты. Соня нарисовала открытки и продала все десять. Все деньги класс отдал на корм для животных в приюте.",
      qs: [
        { q: "Что сделала Соня?", a: ["нарисовала открытки", "испекла печенье", "сплела браслеты", "сделала игрушки"] },
        { q: "Сколько открыток продала Соня?", a: ["десять", "пять", "две", "двадцать"] },
        { q: "На что класс отдал деньги?", a: ["на корм для животных", "на новые книги", "на экскурсию", "на подарок учительнице"] },
      ],
    },
    {
      text: "Дима проснулся и посмотрел в окно: крыши домов были белыми, а дети на улице лепили снеговика. Он быстро надел тёплую куртку, шапку и варежки. Мама напомнила, что в девять начинаются уроки, поэтому погулять можно только полчаса.",
      qs: [
        { q: "Какое сейчас время года?", a: ["зима", "осень", "весна", "лето"] },
        { q: "Что делали дети на улице?", a: ["лепили снеговика", "катались на велосипедах", "играли в футбол", "собирали листья"] },
        { q: "Сколько времени Дима может гулять?", a: ["полчаса", "час", "два часа", "весь день"] },
      ],
    },
  ],
  en: [
    {
      text: "Every morning Helen waters the flowers on the balcony. She likes the red tulips best because her grandma planted them. One day Helen noticed that one tulip had wilted. She moved it to a bigger pot, and a week later the flower came back to life.",
      qs: [
        { q: "What does Helen do every morning?", a: ["waters the flowers", "feeds the cat", "reads a book", "goes to school"] },
        { q: "Who planted the tulips?", a: ["grandma", "mom", "Helen", "dad"] },
        { q: "What helped the flower?", a: ["a bigger pot", "new fertilizer", "sunlight", "cold water"] },
      ],
    },
    {
      text: "Andrew decided to make a bird feeder. He took an empty juice carton, cut a little window in it and tied it to a branch of an apple tree. Blue tits were the first to arrive. The next day a woodpecker visited the feeder, but it did not like the seeds.",
      qs: [
        { q: "What did Andrew make the feeder from?", a: ["a juice carton", "wooden boards", "a plastic bottle", "a paper bag"] },
        { q: "Who arrived first?", a: ["blue tits", "sparrows", "a woodpecker", "pigeons"] },
        { q: "Which tree did the feeder hang on?", a: ["an apple tree", "an oak", "a pear tree", "a lime tree"] },
      ],
    },
    {
      text: "The class decided to hold a fair. Every pupil brought something: some baked cookies, others made bracelets. Sophie drew greeting cards and sold all ten of them. The class gave all the money to buy food for the animals at the shelter.",
      qs: [
        { q: "What did Sophie do?", a: ["drew greeting cards", "baked cookies", "made bracelets", "made toys"] },
        { q: "How many cards did Sophie sell?", a: ["ten", "five", "two", "twenty"] },
        { q: "What did the class spend the money on?", a: ["food for shelter animals", "new books", "a school trip", "a present for the teacher"] },
      ],
    },
    {
      text: "Dan woke up and looked out of the window: the roofs were white, and children outside were building a snowman. He quickly put on a warm jacket, a hat and mittens. Mom reminded him that lessons start at nine, so he could only play outside for half an hour.",
      qs: [
        { q: "What season is it?", a: ["winter", "fall", "spring", "summer"] },
        { q: "What were the children doing outside?", a: ["building a snowman", "riding bikes", "playing football", "collecting leaves"] },
        { q: "How long can Dan play outside?", a: ["half an hour", "an hour", "two hours", "all day"] },
      ],
    },
  ],
};


// ---------- reading sentences (6, ceiling after single words) ----------
type Sentence = { text: string; q: string; a: string; w: string[] };
const SENTENCES: Record<Lang, Sentence[]> = {
  uk: [
    { text: "У Марійки червона кулька.", q: "Якого кольору кулька?", a: "🔴", w: ["🔵", "🟢", "🟡"] },
    { text: "Кіт спить на дивані, а пес грає з м'ячем.", q: "Хто грає з м'ячем?", a: "🐶", w: ["🐱", "🐭", "🐰"] },
    { text: "Зайчик сховався під ялинкою.", q: "Хто сховався?", a: "🐰", w: ["🦊", "🐻", "🐿️"] },
    { text: "На столі стоїть ваза з квітами.", q: "Що стоїть на столі?", a: "💐", w: ["📚", "🍞", "🧸"] },
    { text: "Бабуся спекла смачний пиріг.", q: "Що спекла бабуся?", a: "🥧", w: ["🍕", "🍞", "🍪"] },
    { text: "Тато купив три яблука і банан.", q: "Скільки яблук купив тато?", a: "3️⃣", w: ["1️⃣", "2️⃣", "4️⃣"] },
    { text: "Взимку Оля ліпила сніговика.", q: "Коли Оля ліпила сніговика?", a: "❄️", w: ["🌷", "☀️", "🍂"] },
    { text: "Пташка сіла на дах будинку.", q: "Куди сіла пташка?", a: "🏠", w: ["🌳", "🚗", "⛵"] },
    { text: "Сонце сховалося, і пішов дощ.", q: "Яка погода?", a: "🌧️", w: ["☀️", "❄️", "🌈"] },
    { text: "Діти пливуть на човні до острова.", q: "На чому пливуть діти?", a: "⛵", w: ["🚗", "🚲", "✈️"] },
  ],
  ru: [
    { text: "У Маши красный шарик.", q: "Какого цвета шарик?", a: "🔴", w: ["🔵", "🟢", "🟡"] },
    { text: "Кот спит на диване, а пёс играет с мячом.", q: "Кто играет с мячом?", a: "🐶", w: ["🐱", "🐭", "🐰"] },
    { text: "Зайчик спрятался под ёлкой.", q: "Кто спрятался?", a: "🐰", w: ["🦊", "🐻", "🐿️"] },
    { text: "На столе стоит ваза с цветами.", q: "Что стоит на столе?", a: "💐", w: ["📚", "🍞", "🧸"] },
    { text: "Бабушка испекла вкусный пирог.", q: "Что испекла бабушка?", a: "🥧", w: ["🍕", "🍞", "🍪"] },
    { text: "Папа купил три яблока и банан.", q: "Сколько яблок купил папа?", a: "3️⃣", w: ["1️⃣", "2️⃣", "4️⃣"] },
    { text: "Зимой Оля лепила снеговика.", q: "Когда Оля лепила снеговика?", a: "❄️", w: ["🌷", "☀️", "🍂"] },
    { text: "Птичка села на крышу дома.", q: "Куда села птичка?", a: "🏠", w: ["🌳", "🚗", "⛵"] },
    { text: "Солнце спряталось, и пошёл дождь.", q: "Какая погода?", a: "🌧️", w: ["☀️", "❄️", "🌈"] },
    { text: "Дети плывут на лодке к острову.", q: "На чём плывут дети?", a: "⛵", w: ["🚗", "🚲", "✈️"] },
  ],
  en: [
    { text: "Mary has a red balloon.", q: "What color is the balloon?", a: "🔴", w: ["🔵", "🟢", "🟡"] },
    { text: "The cat is sleeping on the couch and the dog is playing with a ball.", q: "Who is playing with the ball?", a: "🐶", w: ["🐱", "🐭", "🐰"] },
    { text: "The bunny hid under the fir tree.", q: "Who hid?", a: "🐰", w: ["🦊", "🐻", "🐿️"] },
    { text: "There is a vase of flowers on the table.", q: "What is on the table?", a: "💐", w: ["📚", "🍞", "🧸"] },
    { text: "Grandma baked a tasty pie.", q: "What did Grandma bake?", a: "🥧", w: ["🍕", "🍞", "🍪"] },
    { text: "Dad bought three apples and a banana.", q: "How many apples did Dad buy?", a: "3️⃣", w: ["1️⃣", "2️⃣", "4️⃣"] },
    { text: "In winter Olly made a snowman.", q: "When did Olly make a snowman?", a: "❄️", w: ["🌷", "☀️", "🍂"] },
    { text: "A bird sat on the roof of the house.", q: "Where did the bird sit?", a: "🏠", w: ["🌳", "🚗", "⛵"] },
    { text: "The sun hid and it started to rain.", q: "What is the weather like?", a: "🌧️", w: ["☀️", "❄️", "🌈"] },
    { text: "The children are sailing a boat to an island.", q: "What are the children in?", a: "⛵", w: ["🚗", "🚲", "✈️"] },
  ],
};


const SENTENCES_MORE: Record<Lang, Sentence[]> = {
  uk: [
    { text: "Дівчинка їсть морозиво.", q: "Що їсть дівчинка?", a: "🍦", w: ["🍕", "🍎", "🥕"] },
    { text: "У небі летить літак.", q: "Що летить у небі?", a: "✈️", w: ["🚗", "🚂", "⛵"] },
    { text: "Мама купила дві груші.", q: "Скільки груш купила мама?", a: "2️⃣", w: ["1️⃣", "3️⃣", "4️⃣"] },
    { text: "Ведмідь спить у барлозі всю зиму.", q: "Хто спить узимку?", a: "🐻", w: ["🐰", "🦊", "🐿️"] },
    { text: "На галявині виросли гриби.", q: "Що виросло на галявині?", a: "🍄", w: ["🌸", "🌳", "🥕"] },
    { text: "Петрик грає на барабані.", q: "На чому грає Петрик?", a: "🥁", w: ["🎸", "🎹", "🎺"] },
    { text: "Котик п'є молоко з мисочки.", q: "Що п'є котик?", a: "🥛", w: ["🧃", "☕", "🍵"] },
    { text: "Увечері на небі з'явився місяць.", q: "Що з'явилося на небі?", a: "🌙", w: ["☀️", "🌈", "⭐"] },
    { text: "Діти будують замок із піску.", q: "Що будують діти?", a: "🏰", w: ["🏠", "⛺", "🚀"] },
    { text: "Жовте курча сховалося в траві.", q: "Якого кольору курча?", a: "🟡", w: ["🔴", "🔵", "🟢"] },
  ],
  ru: [
    { text: "Девочка ест мороженое.", q: "Что ест девочка?", a: "🍦", w: ["🍕", "🍎", "🥕"] },
    { text: "В небе летит самолёт.", q: "Что летит в небе?", a: "✈️", w: ["🚗", "🚂", "⛵"] },
    { text: "Мама купила две груши.", q: "Сколько груш купила мама?", a: "2️⃣", w: ["1️⃣", "3️⃣", "4️⃣"] },
    { text: "Медведь спит в берлоге всю зиму.", q: "Кто спит зимой?", a: "🐻", w: ["🐰", "🦊", "🐿️"] },
    { text: "На поляне выросли грибы.", q: "Что выросло на поляне?", a: "🍄", w: ["🌸", "🌳", "🥕"] },
    { text: "Петя играет на барабане.", q: "На чём играет Петя?", a: "🥁", w: ["🎸", "🎹", "🎺"] },
    { text: "Котик пьёт молоко из миски.", q: "Что пьёт котик?", a: "🥛", w: ["🧃", "☕", "🍵"] },
    { text: "Вечером на небе появилась луна.", q: "Что появилось на небе?", a: "🌙", w: ["☀️", "🌈", "⭐"] },
    { text: "Дети строят замок из песка.", q: "Что строят дети?", a: "🏰", w: ["🏠", "⛺", "🚀"] },
    { text: "Жёлтый цыплёнок спрятался в траве.", q: "Какого цвета цыплёнок?", a: "🟡", w: ["🔴", "🔵", "🟢"] },
  ],
  en: [
    { text: "The girl is eating ice cream.", q: "What is the girl eating?", a: "🍦", w: ["🍕", "🍎", "🥕"] },
    { text: "A plane is flying in the sky.", q: "What is flying in the sky?", a: "✈️", w: ["🚗", "🚂", "⛵"] },
    { text: "Mom bought two pears.", q: "How many pears did Mom buy?", a: "2️⃣", w: ["1️⃣", "3️⃣", "4️⃣"] },
    { text: "The bear sleeps in its den all winter.", q: "Who sleeps all winter?", a: "🐻", w: ["🐰", "🦊", "🐿️"] },
    { text: "Mushrooms grew in the clearing.", q: "What grew in the clearing?", a: "🍄", w: ["🌸", "🌳", "🥕"] },
    { text: "Peter is playing the drum.", q: "What is Peter playing?", a: "🥁", w: ["🎸", "🎹", "🎺"] },
    { text: "The kitten drinks milk from a bowl.", q: "What does the kitten drink?", a: "🥛", w: ["🧃", "☕", "🍵"] },
    { text: "In the evening the moon appeared in the sky.", q: "What appeared in the sky?", a: "🌙", w: ["☀️", "🌈", "⭐"] },
    { text: "The children are building a sand castle.", q: "What are the children building?", a: "🏰", w: ["🏠", "⛺", "🚀"] },
    { text: "The yellow chick hid in the grass.", q: "What color is the chick?", a: "🟡", w: ["🔴", "🔵", "🟢"] },
  ],
};

const TEXTS_MORE: Record<Lang, Text[]> = {
  uk: [
    {
      text: "Бджоли живуть великими родинами у вуликах. Найголовніша в родині бджола-матка, вона відкладає яйця. Робочі бджоли збирають нектар із квітів і роблять з нього мед. Щоб показати подругам, де багато квітів, бджола виконує особливий танець.",
      qs: [
        { q: "Хто відкладає яйця?", a: ["бджола-матка", "робоча бджола", "трутень", "пасічник"] },
        { q: "З чого бджоли роблять мед?", a: ["з нектару квітів", "з пилку дерев", "з води", "з цукру"] },
        { q: "Навіщо бджола танцює?", a: ["щоб показати, де квіти", "щоб зігрітися", "щоб прогнати осу", "щоб розбудити матку"] },
      ],
    },
    {
      text: "У суботу родина Коваленків поїхала до лісу на велосипедах. Спочатку вони зупинилися біля озера, щоб погодувати качок. Потім тато розпалив маленьке багаття, і всі смажили сосиски. Додому повернулися ввечері, втомлені, але щасливі.",
      qs: [
        { q: "На чому родина поїхала до лісу?", a: ["на велосипедах", "на машині", "на автобусі", "пішки"] },
        { q: "Що вони зробили спочатку?", a: ["погодували качок", "розпалили багаття", "смажили сосиски", "повернулися додому"] },
        { q: "Коли вони повернулися додому?", a: ["увечері", "вранці", "опівдні", "наступного дня"] },
      ],
    },
    {
      text: "Марко забув удома парасольку. Коли уроки закінчилися, він подивився у вікно і зітхнув: на вулиці лило як із відра. Тоді його друг Остап сказав: «Ходімо разом, моєї парасольки вистачить на двох».",
      qs: [
        { q: "Що Марко забув удома?", a: ["парасольку", "рюкзак", "обід", "шапку"] },
        { q: "Чому Марко зітхнув?", a: ["бо йшов сильний дощ", "бо був голодний", "бо отримав погану оцінку", "бо втомився"] },
        { q: "Як Остап допоміг другові?", a: ["запропонував іти під однією парасолькою", "дав йому свою куртку", "подзвонив його мамі", "почекав, поки дощ скінчиться"] },
      ],
    },
    {
      text: "Синій кит є найбільшою твариною на Землі. Він може бути довшим за три автобуси, що стоять один за одним. Попри величезний розмір, кит їсть дрібних рачків, яких називають крилем. Щодня він з'їдає кілька тонн такої їжі.",
      qs: [
        { q: "Яка тварина найбільша на Землі?", a: ["синій кит", "слон", "акула", "жирафа"] },
        { q: "Що їсть синій кит?", a: ["криль", "великих риб", "водорості", "тюленів"] },
        { q: "З чим порівнюють довжину кита?", a: ["з трьома автобусами", "з будинком", "з поїздом", "з футбольним полем"] },
      ],
    },
  ],
  ru: [
    {
      text: "Пчёлы живут большими семьями в ульях. Самая главная в семье пчела-матка, она откладывает яйца. Рабочие пчёлы собирают нектар с цветов и делают из него мёд. Чтобы показать подругам, где много цветов, пчела исполняет особый танец.",
      qs: [
        { q: "Кто откладывает яйца?", a: ["пчела-матка", "рабочая пчела", "трутень", "пасечник"] },
        { q: "Из чего пчёлы делают мёд?", a: ["из нектара цветов", "из пыльцы деревьев", "из воды", "из сахара"] },
        { q: "Зачем пчела танцует?", a: ["чтобы показать, где цветы", "чтобы согреться", "чтобы прогнать осу", "чтобы разбудить матку"] },
      ],
    },
    {
      text: "В субботу семья Коваленко поехала в лес на велосипедах. Сначала они остановились у озера, чтобы покормить уток. Потом папа развёл маленький костёр, и все жарили сосиски. Домой вернулись вечером, уставшие, но счастливые.",
      qs: [
        { q: "На чём семья поехала в лес?", a: ["на велосипедах", "на машине", "на автобусе", "пешком"] },
        { q: "Что они сделали сначала?", a: ["покормили уток", "развели костёр", "жарили сосиски", "вернулись домой"] },
        { q: "Когда они вернулись домой?", a: ["вечером", "утром", "в полдень", "на следующий день"] },
      ],
    },
    {
      text: "Марк забыл дома зонт. Когда уроки закончились, он посмотрел в окно и вздохнул: на улице лило как из ведра. Тогда его друг Остап сказал: «Пойдём вместе, моего зонта хватит на двоих».",
      qs: [
        { q: "Что Марк забыл дома?", a: ["зонт", "рюкзак", "обед", "шапку"] },
        { q: "Почему Марк вздохнул?", a: ["потому что шёл сильный дождь", "потому что был голоден", "потому что получил плохую оценку", "потому что устал"] },
        { q: "Как Остап помог другу?", a: ["предложил идти под одним зонтом", "дал ему свою куртку", "позвонил его маме", "подождал, пока дождь закончится"] },
      ],
    },
    {
      text: "Синий кит является самым большим животным на Земле. Он может быть длиннее трёх автобусов, стоящих друг за другом. Несмотря на огромный размер, кит ест мелких рачков, которых называют крилем. Каждый день он съедает несколько тонн такой еды.",
      qs: [
        { q: "Какое животное самое большое на Земле?", a: ["синий кит", "слон", "акула", "жираф"] },
        { q: "Что ест синий кит?", a: ["криль", "крупную рыбу", "водоросли", "тюленей"] },
        { q: "С чем сравнивают длину кита?", a: ["с тремя автобусами", "с домом", "с поездом", "с футбольным полем"] },
      ],
    },
  ],
  en: [
    {
      text: "Bees live in big families in hives. The most important bee in the family is the queen, and she lays the eggs. Worker bees collect nectar from flowers and make honey from it. To show their friends where there are lots of flowers, a bee does a special dance.",
      qs: [
        { q: "Who lays the eggs?", a: ["the queen", "a worker bee", "a drone", "the beekeeper"] },
        { q: "What do bees make honey from?", a: ["flower nectar", "tree pollen", "water", "sugar"] },
        { q: "Why does a bee dance?", a: ["to show where the flowers are", "to keep warm", "to chase away a wasp", "to wake the queen"] },
      ],
    },
    {
      text: "On Saturday the Kovalenko family rode their bikes to the forest. First they stopped by the lake to feed the ducks. Then Dad lit a small campfire and everyone cooked sausages. They came home in the evening, tired but happy.",
      qs: [
        { q: "How did the family get to the forest?", a: ["by bike", "by car", "by bus", "on foot"] },
        { q: "What did they do first?", a: ["fed the ducks", "lit a campfire", "cooked sausages", "went home"] },
        { q: "When did they come home?", a: ["in the evening", "in the morning", "at noon", "the next day"] },
      ],
    },
    {
      text: "Mark left his umbrella at home. When lessons were over, he looked out of the window and sighed: it was pouring with rain. Then his friend Ostap said, \"Let's walk together, my umbrella is big enough for two.\"",
      qs: [
        { q: "What did Mark leave at home?", a: ["his umbrella", "his backpack", "his lunch", "his hat"] },
        { q: "Why did Mark sigh?", a: ["because it was raining hard", "because he was hungry", "because he got a bad mark", "because he was tired"] },
        { q: "How did Ostap help his friend?", a: ["offered to share his umbrella", "gave him his jacket", "called his mom", "waited for the rain to stop"] },
      ],
    },
    {
      text: "The blue whale is the largest animal on Earth. It can be longer than three buses parked in a row. Even though it is huge, the whale eats tiny shrimp-like animals called krill. Every day it eats several tons of this food.",
      qs: [
        { q: "What is the largest animal on Earth?", a: ["the blue whale", "the elephant", "the shark", "the giraffe"] },
        { q: "What does the blue whale eat?", a: ["krill", "big fish", "seaweed", "seals"] },
        { q: "What is the whale's length compared to?", a: ["three buses", "a house", "a train", "a soccer field"] },
      ],
    },
  ],
};


// ---------- short stories with retelling (6) ----------
type Story = { text: string; qs: { q: string; a: string; w: string[] }[]; events: string[] };
const STORIES: Record<Lang, Story[]> = {
  uk: [
    { text: "Котик Мурчик знайшов клубок. Він довго грався з ним. Потім Мурчик заснув на дивані.",
      qs: [{ q: "Що знайшов котик?", a: "🧶", w: ["⚽", "🦴", "🧸"] }, { q: "Де заснув Мурчик?", a: "🛋️", w: ["🛏️", "🌳", "🚗"] }],
      events: ["🧶 Знайшов клубок", "🐱 Грався з клубком", "😴 Заснув на дивані"] },
    { text: "Оля посадила насінину. Вона щодня поливала її водою. Через тиждень виросла квітка.",
      qs: [{ q: "Що посадила Оля?", a: "🌱", w: ["🍎", "🥕", "🌳"] }, { q: "Що виросло?", a: "🌸", w: ["🍄", "🌳", "🍓"] }],
      events: ["🌱 Посадила насінину", "💧 Поливала водою", "🌸 Виросла квітка"] },
    { text: "Тато і Сергійко пішли на річку. Вони ловили рибу. Сергійко впіймав велику рибу.",
      qs: [{ q: "Куди пішли тато і Сергійко?", a: "🏞️", w: ["🏫", "🏪", "🏥"] }, { q: "Що впіймав Сергійко?", a: "🐟", w: ["🦀", "🐸", "🦆"] }],
      events: ["🚶 Пішли на річку", "🎣 Ловили рибу", "🐟 Сергійко впіймав рибу"] },
    { text: "Пішов сніг. Діти одягли теплі куртки. Вони зліпили великого сніговика.",
      qs: [{ q: "Яка була погода?", a: "❄️", w: ["☀️", "🌧️", "🌈"] }, { q: "Кого зліпили діти?", a: "⛄", w: ["🐻", "🏰", "🐶"] }],
      events: ["❄️ Пішов сніг", "🧥 Одягли куртки", "⛄ Зліпили сніговика"] },
    { text: "Їжачок готувався до зими. Він збирав у лісі гриби та яблука. Раптом почався дощ. Їжачок сховався під великим листком. Коли дощ скінчився, він поніс запаси додому.",
      qs: [{ q: "Що збирав їжачок?", a: "🍄", w: ["🥕", "🍌", "🧀"] }, { q: "Що сталося, коли їжачок збирав запаси?", a: "🌧️", w: ["❄️", "🌈", "🌙"] }],
      events: ["🍄 Збирав гриби та яблука", "🌧️ Почався дощ", "🍂 Сховався під листком", "🏠 Поніс запаси додому"] },
    { text: "У Марти був день народження. Мама спекла торт зі свічками. Прийшли друзі й подарували ведмедика. Марта загадала бажання і задула свічки.",
      qs: [{ q: "Що спекла мама?", a: "🎂", w: ["🍕", "🍪", "🥞"] }, { q: "Що подарували друзі?", a: "🧸", w: ["🚗", "⚽", "🎈"] }],
      events: ["🎂 Мама спекла торт", "👫 Прийшли друзі", "🎁 Подарували ведмедика", "🕯️ Марта задула свічки"] },
    { text: "Песик Бім загубив свій м'ячик. Він шукав його в саду і в будці. Потім Бім побачив м'ячик під кущем. Він радісно приніс його хлопчикові.",
      qs: [{ q: "Що загубив Бім?", a: "⚽", w: ["🦴", "🧸", "🥣"] }, { q: "Де знайшовся м'ячик?", a: "🌿", w: ["🏠", "🛏️", "🚗"] }],
      events: ["😢 Бім загубив м'ячик", "🔍 Шукав у саду", "🌿 Побачив м'ячик під кущем", "🐶 Приніс м'ячик хлопчикові"] },
    { text: "Вранці Марія прокинулася і вмилася. Потім вона снідала кашею. Після сніданку Марія пішла до школи. Там вона читала цікаву книжку.",
      qs: [{ q: "Що Марія їла на сніданок?", a: "🥣", w: ["🍕", "🍔", "🍰"] }, { q: "Куди пішла Марія?", a: "🏫", w: ["🏥", "🏪", "🏞️"] }],
      events: ["🚿 Прокинулася і вмилася", "🥣 Снідала кашею", "🏫 Пішла до школи", "📖 Читала книжку"] },
  ],
  ru: [
    { text: "Котик Мурчик нашёл клубок. Он долго играл с ним. Потом Мурчик уснул на диване.",
      qs: [{ q: "Что нашёл котик?", a: "🧶", w: ["⚽", "🦴", "🧸"] }, { q: "Где уснул Мурчик?", a: "🛋️", w: ["🛏️", "🌳", "🚗"] }],
      events: ["🧶 Нашёл клубок", "🐱 Играл с клубком", "😴 Уснул на диване"] },
    { text: "Оля посадила семечко. Она каждый день поливала его водой. Через неделю вырос цветок.",
      qs: [{ q: "Что посадила Оля?", a: "🌱", w: ["🍎", "🥕", "🌳"] }, { q: "Что выросло?", a: "🌸", w: ["🍄", "🌳", "🍓"] }],
      events: ["🌱 Посадила семечко", "💧 Поливала водой", "🌸 Вырос цветок"] },
    { text: "Папа и Марія пошли на речку. Они ловили рыбу. Марія поймал большую рыбу.",
      qs: [{ q: "Куда пошли папа и Марія?", a: "🏞️", w: ["🏫", "🏪", "🏥"] }, { q: "Что поймал Марія?", a: "🐟", w: ["🦀", "🐸", "🦆"] }],
      events: ["🚶 Пошли на речку", "🎣 Ловили рыбу", "🐟 Марія поймал рыбу"] },
    { text: "Пошёл снег. Дети надели тёплые куртки. Они слепили большого снеговика.",
      qs: [{ q: "Какая была погода?", a: "❄️", w: ["☀️", "🌧️", "🌈"] }, { q: "Кого слепили дети?", a: "⛄", w: ["🐻", "🏰", "🐶"] }],
      events: ["❄️ Пошёл снег", "🧥 Надели куртки", "⛄ Слепили снеговика"] },
    { text: "Ёжик готовился к зиме. Он собирал в лесу грибы и яблоки. Вдруг пошёл дождь. Ёжик спрятался под большим листом. Когда дождь кончился, он понёс запасы домой.",
      qs: [{ q: "Что собирал ёжик?", a: "🍄", w: ["🥕", "🍌", "🧀"] }, { q: "Что случилось, когда ёжик собирал запасы?", a: "🌧️", w: ["❄️", "🌈", "🌙"] }],
      events: ["🍄 Собирал грибы и яблоки", "🌧️ Пошёл дождь", "🍂 Спрятался под листом", "🏠 Понёс запасы домой"] },
    { text: "У Марты был день рождения. Мама испекла торт со свечами. Пришли друзья и подарили мишку. Марта загадала желание и задула свечи.",
      qs: [{ q: "Что испекла мама?", a: "🎂", w: ["🍕", "🍪", "🥞"] }, { q: "Что подарили друзья?", a: "🧸", w: ["🚗", "⚽", "🎈"] }],
      events: ["🎂 Мама испекла торт", "👫 Пришли друзья", "🎁 Подарили мишку", "🕯️ Марта задула свечи"] },
    { text: "Пёсик Бим потерял свой мячик. Он искал его в саду и в будке. Потом Бим увидел мячик под кустом. Он радостно принёс его мальчику.",
      qs: [{ q: "Что потерял Бим?", a: "⚽", w: ["🦴", "🧸", "🥣"] }, { q: "Где нашёлся мячик?", a: "🌿", w: ["🏠", "🛏️", "🚗"] }],
      events: ["😢 Бим потерял мячик", "🔍 Искал в саду", "🌿 Увидел мячик под кустом", "🐶 Принёс мячик мальчику"] },
    { text: "Утром Марія проснулась и умылась. Потом она завтракала кашей. После завтрака Марія пошла в школу. Там она читала интересную книгу.",
      qs: [{ q: "Что Марія ела на завтрак?", a: "🥣", w: ["🍕", "🍔", "🍰"] }, { q: "Куда пошла Марія?", a: "🏫", w: ["🏥", "🏪", "🏞️"] }],
      events: ["🚿 Проснулась и умылась", "🥣 Завтракала кашей", "🏫 Пошла в школу", "📖 Читала книгу"] },
  ],
  en: [
    { text: "Whiskers the cat found a ball of yarn. He played with it for a long time. Then Whiskers fell asleep on the couch.",
      qs: [{ q: "What did the cat find?", a: "🧶", w: ["⚽", "🦴", "🧸"] }, { q: "Where did Whiskers fall asleep?", a: "🛋️", w: ["🛏️", "🌳", "🚗"] }],
      events: ["🧶 Found the yarn", "🐱 Played with the yarn", "😴 Fell asleep on the couch"] },
    { text: "Olly planted a seed. She watered it every day. A week later a flower grew.",
      qs: [{ q: "What did Olly plant?", a: "🌱", w: ["🍎", "🥕", "🌳"] }, { q: "What grew?", a: "🌸", w: ["🍄", "🌳", "🍓"] }],
      events: ["🌱 Planted a seed", "💧 Watered it", "🌸 A flower grew"] },
    { text: "Dad and Sam went to the river. They went fishing. Sam caught a big fish.",
      qs: [{ q: "Where did Dad and Sam go?", a: "🏞️", w: ["🏫", "🏪", "🏥"] }, { q: "What did Sam catch?", a: "🐟", w: ["🦀", "🐸", "🦆"] }],
      events: ["🚶 Went to the river", "🎣 Went fishing", "🐟 Sam caught a fish"] },
    { text: "It started to snow. The children put on warm jackets. They built a big snowman.",
      qs: [{ q: "What was the weather like?", a: "❄️", w: ["☀️", "🌧️", "🌈"] }, { q: "What did the children build?", a: "⛄", w: ["🐻", "🏰", "🐶"] }],
      events: ["❄️ It started to snow", "🧥 Put on jackets", "⛄ Built a snowman"] },
    { text: "The hedgehog was getting ready for winter. He collected mushrooms and apples in the forest. Suddenly it started to rain. The hedgehog hid under a big leaf. When the rain stopped, he carried his food home.",
      qs: [{ q: "What did the hedgehog collect?", a: "🍄", w: ["🥕", "🍌", "🧀"] }, { q: "What happened while he was collecting food?", a: "🌧️", w: ["❄️", "🌈", "🌙"] }],
      events: ["🍄 Collected mushrooms and apples", "🌧️ It started to rain", "🍂 Hid under a leaf", "🏠 Carried the food home"] },
    { text: "It was Martha's birthday. Mom baked a cake with candles. Friends came and gave her a teddy bear. Martha made a wish and blew out the candles.",
      qs: [{ q: "What did Mom bake?", a: "🎂", w: ["🍕", "🍪", "🥞"] }, { q: "What did the friends give her?", a: "🧸", w: ["🚗", "⚽", "🎈"] }],
      events: ["🎂 Mom baked a cake", "👫 Friends came", "🎁 They gave a teddy bear", "🕯️ Martha blew out the candles"] },
    { text: "Bim the puppy lost his ball. He looked for it in the yard and in his doghouse. Then Bim saw the ball under a bush. He happily brought it to the boy.",
      qs: [{ q: "What did Bim lose?", a: "⚽", w: ["🦴", "🧸", "🥣"] }, { q: "Where was the ball?", a: "🌿", w: ["🏠", "🛏️", "🚗"] }],
      events: ["😢 Bim lost his ball", "🔍 Looked in the yard", "🌿 Saw the ball under a bush", "🐶 Brought the ball to the boy"] },
    { text: "In the morning Mia woke up and washed her face. Then she had oatmeal for breakfast. After breakfast Mia went to school. There she read an interesting book.",
      qs: [{ q: "What did Mia have for breakfast?", a: "🥣", w: ["🍕", "🍔", "🍰"] }, { q: "Where did Mia go?", a: "🏫", w: ["🏥", "🏪", "🏞️"] }],
      events: ["🚿 Woke up and washed", "🥣 Had oatmeal", "🏫 Went to school", "📖 Read a book"] },
  ],
};
// ---------- English reading content, graded for ages 5–8 ----------
type S = Sentence;
const s = (text: string, q: string, a: string, w: string[]): S => ({ text, q, a, w });
/** Sentences by level: L1 3–4 words, L2 5–6, L3 7–8, L4 9–11, L5 two clauses or two sentences. */
const EN_SENTENCES: S[][] = [
  [
    s("The cat is big.", "What is big?", "🐱", ["🐶", "🐭", "🐰"]),
    s("I see a red bus.", "What do I see?", "🚌", ["🚗", "🚲", "🚂"]),
    s("The dog can run.", "Who can run?", "🐶", ["🐟", "🐢", "🐌"]),
    s("The fish can swim.", "Who can swim?", "🐟", ["🐦", "🐶", "🐄"]),
    s("I like my hat.", "What do I like?", "🎩", ["👟", "🧤", "🧣"]),
    s("The sun is hot.", "What is hot?", "☀️", ["🌙", "⭐", "☁️"]),
    s("Mom has a cup.", "What does Mom have?", "☕", ["🥄", "🧸", "🎈"]),
    s("The frog is green.", "What color is the frog?", "🟢", ["🔴", "🔵", "🟡"]),
    s("I can see a bee.", "What can I see?", "🐝", ["🐞", "🦋", "🐛"]),
    s("The pig is pink.", "Who is pink?", "🐷", ["🐮", "🐴", "🐑"]),
    s("We have a box.", "What do we have?", "📦", ["🧸", "⚽", "🪁"]),
    s("Dad has a car.", "What does Dad have?", "🚗", ["🚲", "⛵", "✈️"]),
    s("The moon is up.", "What is up in the sky?", "🌙", ["☀️", "🌈", "⚡"]),
    s("I see a cow.", "What do I see?", "🐮", ["🐷", "🐴", "🐑"]),
    s("The bed is red.", "What color is the bed?", "🔴", ["🔵", "🟢", "🟡"]),
    s("A hen is on the box.", "Who is on the box?", "🐔", ["🦆", "🐱", "🐸"]),
    s("The cake is big.", "What is big?", "🎂", ["🍪", "🍎", "🍞"]),
    s("I have a kite.", "What do I have?", "🪁", ["🎈", "🧸", "⚽"]),
    s("The ship is on the sea.", "What is on the sea?", "🚢", ["🚗", "🚂", "✈️"]),
    s("Look at the duck.", "Who do we look at?", "🦆", ["🐔", "🐦", "🐟"]),
    s("The bus is red.", "What color is the bus?", "🔴", ["🔵", "🟢", "🟡"]),
    s("We like to sing.", "What do we like to do?", "🎤", ["⚽", "🚲", "🏊"]),
    s("The bug is on a leaf.", "What is the bug on?", "🍃", ["🌸", "🪨", "🍎"]),
    s("Go to bed.", "Where do we go?", "🛏️", ["🛁", "🚗", "🏫"]),
    s("I can jump.", "What can I do?", "🤸", ["🏊", "🚲", "🎤"]),
  ],
  [
    s("The bird sits in the tree.", "Where is the bird?", "🌳", ["🏠", "🚗", "🌊"]),
    s("My cat likes to drink milk.", "What does the cat drink?", "🥛", ["🧃", "☕", "🍵"]),
    s("We play ball in the park.", "What do we play with?", "⚽", ["🧸", "🪁", "🎲"]),
    s("The duck swims in the pond.", "Who swims in the pond?", "🦆", ["🐔", "🐶", "🐱"]),
    s("I have two red apples.", "How many apples do I have?", "2️⃣", ["1️⃣", "3️⃣", "4️⃣"]),
    s("The bus is big and yellow.", "What color is the bus?", "🟡", ["🔴", "🔵", "🟢"]),
    s("Sam can ride a bike.", "What can Sam ride?", "🚲", ["🚗", "🐴", "🛴"]),
    s("A snail is very slow.", "Who is slow?", "🐌", ["🐇", "🐆", "🐎"]),
    s("Grandma bakes a cherry pie.", "What does Grandma bake?", "🥧", ["🍞", "🍪", "🎂"]),
    s("It is cold and it snows.", "What is the weather like?", "❄️", ["☀️", "🌧️", "🌈"]),
    s("The cow eats green grass.", "What does the cow eat?", "🌿", ["🥕", "🍎", "🦴"]),
    s("I wear boots in the rain.", "What do I wear in the rain?", "👢", ["👟", "🩴", "🧦"]),
  ],
  [
    s("The girl is eating a big ice cream.", "What is the girl eating?", "🍦", ["🍕", "🍎", "🥕"]),
    s("A plane is flying high in the sky.", "What is flying in the sky?", "✈️", ["🚂", "🚗", "⛵"]),
    s("The kitten drinks milk from a little bowl.", "What does the kitten drink?", "🥛", ["🧃", "☕", "🍵"]),
    s("Mom bought two pears and one banana.", "How many pears did Mom buy?", "2️⃣", ["1️⃣", "3️⃣", "4️⃣"]),
    s("The children are building a sand castle.", "What are the children building?", "🏰", ["🏠", "⛺", "🚀"]),
    s("In the evening the moon came out.", "What came out in the evening?", "🌙", ["☀️", "🌈", "⛅"]),
    s("Peter is playing the drum very loudly.", "What is Peter playing?", "🥁", ["🎸", "🎹", "🎺"]),
    s("The yellow chick is hiding in the grass.", "What color is the chick?", "🟡", ["🔴", "🔵", "🟢"]),
    s("The bear sleeps in its den all winter.", "Who sleeps all winter?", "🐻", ["🐰", "🦊", "🐿️"]),
    s("We wear hats and mittens in the snow.", "What do we wear in the snow?", "🧤", ["🩳", "👙", "🕶️"]),
    s("A little mouse ran under the bed.", "Where did the mouse run?", "🛏️", ["🚗", "🌳", "🛁"]),
    s("Dad made pancakes for breakfast today.", "What did Dad make?", "🥞", ["🍕", "🍔", "🍝"]),
  ],
  [
    s("Mary has a red balloon and a blue kite.", "What color is the balloon?", "🔴", ["🔵", "🟢", "🟡"]),
    s("Mushrooms and flowers grew in the forest after the rain.", "What grew in the forest?", "🍄", ["🥕", "🍎", "🌵"]),
    s("The bunny hid under the big tree in our yard.", "Who hid under the tree?", "🐰", ["🦊", "🐻", "🐿️"]),
    s("Dad bought three apples and a banana at the store.", "How many apples did Dad buy?", "3️⃣", ["1️⃣", "2️⃣", "4️⃣"]),
    s("In winter Olly made a snowman with a carrot nose.", "When did Olly make a snowman?", "❄️", ["🌷", "☀️", "🍂"]),
    s("A little bird sat on the roof of our house.", "Where did the bird sit?", "🏠", ["🌳", "🚗", "⛵"]),
    s("The sun went away and it started to rain.", "What is the weather like now?", "🌧️", ["☀️", "❄️", "🌈"]),
    s("The children took a boat across the lake.", "What did the children take?", "⛵", ["🚗", "🚲", "✈️"]),
    s("There is a vase of flowers on the kitchen table.", "What is on the table?", "💐", ["📚", "🍞", "🧸"]),
    s("My brother plays the guitar and I play the piano.", "What do I play?", "🎹", ["🎸", "🥁", "🎺"]),
    s("We went to the zoo and saw a tall giraffe.", "What animal did we see?", "🦒", ["🐘", "🦁", "🐒"]),
    s("Lily packed a sandwich and an apple for lunch.", "What fruit did Lily pack?", "🍎", ["🍌", "🍐", "🍇"]),
  ],
  [
    s("The cat is sleeping on the couch, and the dog is playing with a ball.", "Who is playing with the ball?", "🐶", ["🐱", "🐭", "🐰"]),
    s("Ben wanted to go swimming, but it was raining. So he stayed home and read a book.", "What did Ben do?", "📖", ["🏊", "⚽", "🚲"]),
    s("Ana has three pencils. She gave one to her friend.", "How many pencils does Ana have now?", "2️⃣", ["1️⃣", "3️⃣", "4️⃣"]),
    s("First we planted the seeds. Then we watered them every day.", "What did we do first?", "🌱", ["💧", "🌸", "🍎"]),
    s("The owl sleeps during the day and hunts at night.", "When does the owl hunt?", "🌙", ["☀️", "🌅", "🌈"]),
    s("Tom put on his rain boots before he walked to school.", "What did Tom put on?", "👢", ["👟", "🩴", "🧦"]),
    s("It was Mia's birthday. Her friends brought gifts, and they all ate cake.", "What did they eat?", "🎂", ["🍕", "🍦", "🍩"]),
    s("The leaves turned red and orange and fell from the trees.", "What season is it?", "🍂", ["❄️", "🌷", "☀️"]),
    s("Max lost his blue mitten in the snow, so his hand got cold.", "What did Max lose?", "🧤", ["🧣", "🧢", "👢"]),
    s("Grandpa took us fishing at the lake, and I caught a small fish.", "Where did we go fishing?", "🏞️", ["🏖️", "🏫", "🏪"]),
    s("The farmer milks the cow in the morning and feeds the chickens.", "Who gives milk?", "🐮", ["🐔", "🐷", "🐴"]),
    s("The baby was hungry, so Mom gave her a warm bottle.", "What did Mom give the baby?", "🍼", ["🧸", "🍪", "🧦"]),
  ],
];

type St = Story & { long: boolean };
const st = (long: boolean, text: string, qs: { q: string; a: string; w: string[] }[], events: string[]): St => ({ long, text, qs, events });
/** Extra English stories: short ones (3 sentences, 3 events) and longer ones (4 sentences, 4 events). */
const EN_STORIES_MORE: St[] = [
  st(false, "Lucy found a little puppy. She gave it some water. The puppy wagged its tail.",
    [{ q: "What did Lucy find?", a: "🐶", w: ["🐱", "🐰", "🐦"] }, { q: "What did Lucy give the puppy?", a: "💧", w: ["🍕", "🍎", "🧸"] }],
    ["🐶 Found a puppy", "💧 Gave it water", "🐕 The puppy wagged its tail"]),
  st(false, "Ben built a tall tower. The cat jumped on it. The tower fell down.",
    [{ q: "What did Ben build?", a: "🧱", w: ["🚗", "⛵", "🪁"] }, { q: "Who jumped on the tower?", a: "🐱", w: ["🐶", "🐰", "🐭"] }],
    ["🧱 Built a tower", "🐱 The cat jumped on it", "💥 The tower fell down"]),
  st(false, "It was hot outside. Mom bought ice cream. We ate it in the park.",
    [{ q: "What did Mom buy?", a: "🍦", w: ["🍕", "🍩", "🍪"] }, { q: "Where did we eat it?", a: "🏞️", w: ["🏫", "🏠", "🚗"] }],
    ["☀️ It was hot", "🍦 Mom bought ice cream", "🏞️ Ate it in the park"]),
  st(false, "Leo lost his ball. He looked under the bed. The ball was in his toy box.",
    [{ q: "What did Leo lose?", a: "⚽", w: ["🧸", "🚗", "🪁"] }, { q: "Where was the ball?", a: "📦", w: ["🛏️", "🌳", "🚗"] }],
    ["😢 Lost his ball", "🛏️ Looked under the bed", "📦 Found it in the toy box"]),
  st(false, "A bird made a nest. She laid three eggs. Baby birds came out.",
    [{ q: "What did the bird make?", a: "🪺", w: ["🏠", "📦", "🧺"] }, { q: "How many eggs did she lay?", a: "3️⃣", w: ["1️⃣", "2️⃣", "4️⃣"] }],
    ["🪺 Made a nest", "🥚 Laid three eggs", "🐣 Baby birds came out"]),
  st(false, "Grandpa made a kite. We went up the hill. The kite flew up high.",
    [{ q: "What did Grandpa make?", a: "🪁", w: ["🎈", "✈️", "🚀"] }, { q: "Where did we go?", a: "⛰️", w: ["🏖️", "🏫", "🏪"] }],
    ["🪁 Grandpa made a kite", "⛰️ Went up the hill", "☁️ The kite flew high"]),
  st(true, "Emma wanted to make a sandwich. She took two slices of bread. Then she added cheese and a tomato. Finally, she shared it with her brother.",
    [{ q: "What did Emma make?", a: "🥪", w: ["🍕", "🍔", "🥗"] }, { q: "Who did she share it with?", a: "👦", w: ["👵", "🐶", "👩"] }],
    ["🥪 Wanted to make a sandwich", "🍞 Took two slices of bread", "🧀 Added cheese and a tomato", "👦 Shared it with her brother"]),
  st(true, "On Saturday the family went to the beach. Noah built a sandcastle. A big wave washed it away. Noah laughed and built a new one.",
    [{ q: "Where did the family go?", a: "🏖️", w: ["🏞️", "🏫", "🏪"] }, { q: "What washed the castle away?", a: "🌊", w: ["💨", "🐕", "🌧️"] }],
    ["🏖️ Went to the beach", "🏰 Built a sandcastle", "🌊 A wave washed it away", "😄 Built a new one"]),
  st(true, "A little seed fell on the ground. Rain watered it. The sun warmed it. Soon a sunflower grew taller than the fence.",
    [{ q: "What grew from the seed?", a: "🌻", w: ["🌹", "🌳", "🌵"] }, { q: "What warmed the seed?", a: "☀️", w: ["🌙", "🔥", "⭐"] }],
    ["🌰 A seed fell", "🌧️ Rain watered it", "☀️ The sun warmed it", "🌻 A sunflower grew"]),
  st(true, "Zoe's tooth was loose. She bit into a crunchy apple. Out came the tooth! That night she put it under her pillow.",
    [{ q: "What did Zoe bite into?", a: "🍎", w: ["🍌", "🥕", "🍪"] }, { q: "Where did she put the tooth?", a: "🛏️", w: ["👟", "📦", "🎒"] }],
    ["🦷 Her tooth was loose", "🍎 Bit into an apple", "😮 The tooth came out", "🛏️ Put it under the pillow"]),
  st(true, "The class went to a farm. They fed the goats. Then they rode on a tractor. On the bus home, everyone fell asleep.",
    [{ q: "What did the class feed?", a: "🐐", w: ["🐶", "🐟", "🐦"] }, { q: "What did they ride on?", a: "🚜", w: ["🐴", "🚲", "🚂"] }],
    ["🚌 Went to the farm", "🐐 Fed the goats", "🚜 Rode on a tractor", "😴 Fell asleep on the bus"]),
  st(true, "It was raining, so Jack could not play outside. He built a fort with blankets. His dog crawled inside too. They read a book together in the fort.",
    [{ q: "What did Jack build?", a: "⛺", w: ["🏰", "🏠", "🚀"] }, { q: "Who crawled inside the fort?", a: "🐶", w: ["🐱", "👧", "🐰"] }],
    ["🌧️ It was raining", "⛺ Built a blanket fort", "🐶 The dog crawled in", "📖 Read a book together"]),
];

const SP = {
  retell: l("Перекажи історію: розклади події по порядку", "Перескажи историю: разложи события по порядку", "Retell the story: put the events in order"),
  first: l("Що сталося спочатку?", "Что случилось сначала?", "What happened first?"),
  last: l("Чим закінчилася історія?", "Чем закончилась история?", "How did the story end?"),
};

const wordsForLevel = (level: number, lang: Lang) => {
  const maxLen = [4, 5, 6, 8, 20][level - 1];
  const list = BASIC_WORDS.filter((w) => w[lang].replace("'", "").length <= maxLen);
  return list.length >= 6 ? list : BASIC_WORDS;
};

export const langSkills: Skill[] = [
  // ---------- 6 years ----------
  {
    id: "firstLetter",
    subject: "lang",
    age: 6,
    icon: "🔤",
    title: l("Перша літера", "Первая буква", "First letter"),
    gen: (level, lang) => {
      const word = pick(BASIC_WORDS);
      const text = word[lang];
      const first = text[0];
      const alphabet = ALPHABET[lang].split("");
      return {
        kind: "choice",
        prompt: P.firstLetter[lang],
        visual: word.e,
        speak: { text, lang: speechLang[lang], auto: true },
        options: options(up(first), alphabet.map(up), level <= 2 ? 3 : 4),
        answer: up(first),
      };
    },
  },
  {
    id: "readWord",
    subject: "lang",
    age: 6,
    icon: "📖",
    title: l("Читаємо слова", "Читаем слова", "Reading words"),
    gen: (level, lang) => {
      const list = wordsForLevel(level, lang);
      const word = pick(list);
      const others = BASIC_WORDS.filter((w) => w.e !== word.e).map((w) => w.e);
      const text = level <= 2 ? up(word[lang]) : word[lang];
      return {
        kind: "choice",
        prompt: P.readWord[lang],
        visual: text,
        options: options(word.e, others, level <= 1 ? 3 : 4),
        answer: word.e,
        emojiOptions: true,
      };
    },
  },
  {
    id: "missingLetter",
    subject: "lang",
    age: 6,
    icon: "🧩",
    title: l("Пропущена літера", "Пропущенная буква", "Missing letter"),
    gen: (level, lang) => {
      const word = pick(wordsForLevel(Math.min(level + 1, 5), lang));
      const text = word[lang];
      const positions = text
        .split("")
        .map((c, i) => (/[\p{L}]/u.test(c) ? i : -1))
        .filter((i) => i >= 0 && (level > 1 || i > 0));
      const pos = pick(positions);
      const letter = text[pos];
      const masked = up(text.slice(0, pos) + "_" + text.slice(pos + 1));
      return {
        kind: "choice",
        prompt: P.missing[lang],
        visual: `${word.e}\n${masked}`,
        speak: { text, lang: speechLang[lang] },
        options: options(up(letter), ALPHABET[lang].split("").map(up), level <= 2 ? 3 : 4),
        answer: up(letter),
      };
    },
  },

  {
    id: "readSentence6",
    subject: "lang",
    age: 6,
    icon: "📜",
    title: l("Читаємо речення", "Читаем предложения", "Reading sentences"),
    gen: (level, lang) => {
      if (lang === "en") {
        // this level's sentences plus the previous level's, in normal sentence case
        const pool = [...EN_SENTENCES[level - 1], ...(level > 1 ? EN_SENTENCES[level - 2] : [])];
        const x = pick(pool);
        return { kind: "choice", prompt: x.q, passage: x.text, options: shuffle([x.a, ...x.w.slice(0, level <= 1 ? 2 : 3)]), answer: x.a, emojiOptions: true };
      }
      const pool = [...SENTENCES[lang], ...SENTENCES_MORE[lang]];
      const s = pick(pool);
      return { kind: "choice", prompt: s.q, passage: level <= 1 ? up(s.text) : s.text, options: shuffle([s.a, ...s.w.slice(0, level <= 1 ? 2 : 3)]), answer: s.a, emojiOptions: true };
    },
  },

  {
    id: "stories6",
    subject: "lang",
    age: 6,
    icon: "📚",
    title: l("Історії з переказом", "Истории с пересказом", "Stories and retelling"),
    gen: (level, lang) => {
      // levels 1-2: three-sentence stories; 3+: longer ones too
      const all: St[] =
        lang === "en"
          ? [...STORIES.en.map((x, i) => ({ ...x, long: i >= 4 })), ...EN_STORIES_MORE]
          : STORIES[lang].map((x, i) => ({ ...x, long: i >= 4 }));
      const pool = level <= 2 ? all.filter((x) => !x.long) : level >= 4 ? all.filter((x) => x.long) : all;
      const st = pick(pool);
      const kind = level === 1 ? pick(["q", "q", "firstLast"]) : pick(["q", "firstLast", "retell", "retell"]);
      if (kind === "retell") {
        let tokens = shuffle(st.events);
        while (tokens.join("|") === st.events.join("|")) tokens = shuffle(st.events);
        return { kind: "order", prompt: SP.retell[lang], passage: st.text, tokens, answer: st.events.join(" "), readPassage: true, tokenSpeech: speechLang[lang] };
      }
      if (kind === "firstLast") {
        const first = Math.random() < 0.5;
        const right = first ? st.events[0] : st.events[st.events.length - 1];
        return { kind: "choice", prompt: first ? SP.first[lang] : SP.last[lang], passage: st.text, options: shuffle(st.events), answer: right, readPassage: true, optionSpeech: speechLang[lang] };
      }
      const q = pick(st.qs);
      return { kind: "choice", prompt: q.q, passage: st.text, options: shuffle([q.a, ...q.w.slice(0, level <= 1 ? 2 : 3)]), answer: q.a, emojiOptions: true, readPassage: true };
    },
  },

  // ---------- 11 years ----------
  {
    id: "spelling",
    subject: "lang",
    age: 11,
    icon: "✍️",
    title: l("Правопис", "Правописание", "Spelling"),
    gen: (_level, lang) => {
      const [correct, ...wrong] = pick(SPELLING[lang]);
      return { kind: "choice", prompt: P.spelling[lang], options: options(correct, wrong, 3), answer: correct };
    },
  },
  {
    id: "antonyms",
    subject: "lang",
    age: 11,
    icon: "↔️",
    title: l("Антоніми", "Антонимы", "Opposites"),
    gen: (level, lang) => {
      const pairs = ANTONYMS[lang];
      const [a, b] = pick(pairs);
      const flip = Math.random() < 0.5;
      const word = flip ? b : a;
      const ans = flip ? a : b;
      const others = pairs.flat().filter((x) => x !== a && x !== b);
      return { kind: "choice", prompt: P.antonym[lang], visual: word, options: options(ans, others, level <= 2 ? 3 : 4), answer: ans };
    },
  },
  {
    id: "reading",
    subject: "lang",
    age: 11,
    icon: "📚",
    title: l("Читання з розумінням", "Чтение с пониманием", "Reading comprehension"),
    gen: (level, lang) => {
      // levels 1-2: shorter story texts first; 3+: everything, including the fact texts
      const all = [...TEXTS[lang], ...TEXTS_MORE[lang]];
      const texts = level <= 2 ? all.filter((_, i) => i !== 4 && i !== 7) : all;
      const t = pick(texts);
      const q = pick(t.qs);
      return { kind: "choice", prompt: q.q, passage: t.text, options: shuffle(q.a), answer: q.a[0] };
    },
  },
];
