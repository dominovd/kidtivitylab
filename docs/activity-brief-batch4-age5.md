# Бриф: активности, батч 4 (возраст 5, закрываем пробелы хаба)

2026-11-04. Цель: дать странице /age/5-year-olds/ активности под вехи CDC и темы конкурентов, которых в базе нет: рифмы, слоги, буквы имени, пуговицы и одевание, домашние дела, настольные и карточные игры, счёт, простая наука. Возрастные диапазоны широкие, так что активности попадут и в хабы 4 и 6–7 лет.

## Куда класть

| Что | Папка | Имя файла |
| --- | --- | --- |
| Тексты активностей | `content-drafts/activities/` | `<slug>.md` |
| Иллюстрации | `public/images/activities/` | `<slug>.webp` |

После этого я вычитываю тексты, переношу в `src/content/activities/`, прописываю `image` и `image_alt`, добавляю новые активности в таблицу вех на /age/5-year-olds/ и собираю сайт.

## Формат текста

Как у существующих активностей (образцы: `walk-this-way.md`, `water-painting.md`, `rice-sensory-bin.md`). Схема: `src/content.config.ts`.

- Фронтматтер: все поля из job-файла (возраст в месяцах, place, time_minutes, materials, goals, involvement, situations, seasons) плюс hook (до 120 символов), materials_list, skills_developed (4), safety_note (если в job есть safety_points), tips, setup_minutes, cleanup_minutes, mess_level, energy_level, adult_help, why_kids_love_it, before_you_start (3), learning_details (3), variations (3), common_problems (2), faqs (2), last_updated.
- **Порядок goals не менять.** Первая цель определяет раздел каталога на странице возраста.
- Тело: 4–6 шагов в виде `1. **Short action.** One or two sentences.`
- `image` и `image_alt` не нужны, их пропишу я.
- Американский английский, конкретика: количества, размеры, минуты, точные фразы для ребёнка.
- Без длинного тире, без статистики, исследований и брендов. Вехи CDC в тексте не цитировать, их я свяжу на странице возраста.
- Если механика взята из видео, добавьте `source_video` (id, title, channel, upload_date, start_seconds).

### Через DeepSeek

Все 14 заданий уже лежат в `scripts/content/activity-jobs-batch4.json`. В каждом есть механика, вехи и пункты по безопасности. Скрипт теперь понимает флаг `--jobs`:

```
node --env-file=.env scripts/content/deepseek-activities.mjs --jobs scripts/content/activity-jobs-batch4.json
```

Одну активность можно прогнать с `--only <slug>`. По опыту батча 3 физические факты всё равно надо проверять (в батче 3 модель написала, что синельная проволока плавает, а она тонет).

## 14 активностей

Колонка «Цели» в порядке важности: первая определяет раздел.

| slug | Название | Возраст | Цели | Материалы | Что закрывает |
| --- | --- | --- | --- | --- | --- |
| rhyme-match-basket | Rhyme Match Basket | 4–7 | speech, stem | household | рифмы |
| rhyme-or-not-hop | Rhyme or Not Hop | 4–8 | speech, energy | none | рифмы + прыжки на одной ноге |
| syllable-clap-names | Syllable Clap Names | 4–7 | speech, calm | none | слоги (фонематический слух) |
| name-puzzle | Name Puzzle | 3.5–6 | speech, motor | paper | буквы своего имени |
| salt-tray-writing | Salt Tray Writing | 3.5–7 | motor, speech | household | письмо букв и цифр |
| button-snake | Felt Button Snake | 3.5–6 | motor, calm | craft | пуговицы |
| dress-up-relay | Dress-Up Relay Race | 4–9 | energy, motor | household | одевание, готовность к школе |
| hopscotch-number-hop | Hopscotch Number Hop | 4–9 | energy, stem | craft | прыжки на одной ноге + цифры |
| sock-match-sort | Sock Match and Sort | 3–6 | stem, motor | household | домашние дела |
| homemade-board-game | Draw Your Own Board Game | 4.5–9 | stem, creative | paper | правила, очерёдность, счёт |
| picture-memory-match | Picture Memory Match | 3.5–8 | stem, calm | paper | внимание, игры по правилам |
| sink-or-float | Sink or Float Predictions | 3–8 | stem, speech | household | простая наука |
| roll-and-build-tower | Roll and Build Tower | 4–7 | stem, motor | household | счёт до 10+ |
| hot-and-cold | Hot and Cold Hide-and-Find | 3–8 | stem, speech | none | внимание, пространственные слова |

Механика и пункты по безопасности для каждой активности описаны в job-файле. Главное по безопасности:

- **Вода:** взрослый у воды всё время.
- **Мелкие предметы:** пуговицы, монеты и детали конструктора держать подальше от детей младше 3 лет.
- **Бег:** не бегать в носках по гладкому полу.
- **Одевание:** никаких шнурков и шарфов на шее.

## Иллюстрации

900×600 WebP, после генерации пережать до quality 80, как в батче 3. Базовый промпт тот же, что в `docs/activity-art-batch3.md`:

> Warm storybook illustration in soft colored pencil and watercolor, detailed but gentle, natural daylight, cozy US home or backyard, diverse kids with friendly round faces, muted greens, warm yellows and terracotta. Landscape 3:2. No text, no logos, no brand names, no rainbows, no screens.

На картинках не должно быть читаемых букв и цифр: генераторы их искажают. Буквы и цифры рисуем как неразборчивые штрихи или отдельные крупные фигуры.

| Файл | Сцена |
| --- | --- |
| rhyme-match-basket.webp | Child about 5 at a kitchen table pulling a sock out of a wicker basket; small objects lined up in pairs on the table (toy cat next to a small hat, toy car next to a jar); parent smiling across the table. |
| rhyme-or-not-hop.webp | Hallway or backyard: child about 5 hopping on one foot toward a parent who stands at the far end with a hand raised like calling a word; a second child frozen in a silly pose. |
| syllable-clap-names.webp | Back seat of a car or family couch: child about 5 clapping hands with a big smile, parent clapping along, small motion lines around the hands. |
| name-puzzle.webp | Child about 5 at a table fitting cut cardstock letter pieces into a row, kid scissors and paper scraps nearby; letters shown as colorful blocky shapes without readable text. |
| salt-tray-writing.webp | Close view of a baking sheet with a thin layer of white salt over orange paper; a child's finger drawing a curvy line; a small paintbrush resting on the edge. |
| button-snake.webp | Child about 5 on a couch threading colorful felt squares onto a ribbon via a big button, the felt "snake" draped across their lap. |
| dress-up-relay.webp | Living room party: two kids about 6 racing to put on oversized shirts and floppy hats, one struggling with a button, other kids cheering. |
| hopscotch-number-hop.webp | Driveway with a chalk hopscotch grid (squares with simple dot marks, no numbers); child about 5 hopping on one foot, a beanbag on one square, parent watching. |
| sock-match-sort.webp | Bed covered with colorful socks; child about 4 holding up two matching striped socks; small rolled pairs in piles by size. |
| homemade-board-game.webp | Kitchen table with a hand-drawn winding path game on big paper, small toy figures as pieces, one die; child about 6 and a parent playing, child mid-roll. |
| picture-memory-match.webp | Floor rug with a grid of face-down handmade cards; child about 5 flipping one card showing a simple drawn sun; another child waiting for a turn. |
| sink-or-float.webp | Clear plastic bin of water on a towel; an apple and a cork floating, a spoon and a rock on the bottom; child about 5 holding a toy car above the water, thinking. |
| roll-and-build-tower.webp | Child about 5 rolling a large die on the table next to a tall wobbly tower of colorful blocks; parent with a shorter tower across the table. |
| hot-and-cold.webp | Living room: child about 5 searching behind a cushion while an older sibling or parent gestures "warmer" with hands; a small toy peeks out from under a blanket nearby. |

## Как проверяю после вас

- Сайт собирается, схема проходит.
- Факты о физике и безопасности.
- Hook не длиннее 120 символов, нет длинных тире.
- Нет дублей с базой (I Spy, Hide and Seek, Picture Clue Treasure Hunt уже есть, механику не повторять).
- Картинки 900×600, без читаемого текста.
