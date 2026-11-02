# Бриф: 12 оригинальных героев для Learn (kidtivitylab.com/learn)

Эти персонажи заменяют героев Brawl Stars в публичной версии. Экономика сохраняется: тот же список стоимостей (10 → 800 монет) и те же редкости, просто новые оригинальные персонажи.

## Технические требования

- **Формат:** PNG или WebP, **квадрат 1:1**, минимум **640×640** (лучше 1024×1024 — я сам уменьшу до 320×320 webp, как сейчас в приложении).
- **Фон: прозрачный** (персонаж-«стикер»). Если генератор не умеет прозрачность — однотонный ровный фон одного цвета (белый/светло-серый), я вырежу.
- Персонаж по центру, **портрет по грудь или в полный рост**, занимает ~80% кадра, ничего не обрезано по краям.
- **Имена файлов** (важно, это id в коде): `pip`, `biscuit`, `luna`, `bolt`, `ember`, `frost`, `coco`, `rex`, `nova`, `shadow`, `zephyr`, `orion`.

## Единый стиль (добавлять к каждому промпту)

> cute cartoon character for a kids learning game, bold clean outlines, vibrant flat colors with soft shading, big expressive friendly eyes, sticker style, centered, plain background, no text

Все 12 должны выглядеть как один набор: одинаковая толщина контура, одинаковая «мультяшность». Лучше генерировать одной сессией/одним стилем.

## Персонажи (от дешёвого к дорогому)

| # | id | Имя | Монеты | Редкость | Описание / промпт |
|---|----|-----|--------|----------|-------------------|
| 1 | `pip` | Pip | 10 | Starting | Круглый жёлтый цыплёнок в лётных очках-гогглах на лбу, задорная улыбка. *A round chubby yellow chick wearing aviator goggles on its forehead, cheerful smile* |
| 2 | `biscuit` | Biscuit | 25 | Rare | Щенок корги в маленьком красном супергеройском плаще, высунул язык. *A corgi puppy wearing a small red superhero cape, tongue out, happy* |
| 3 | `luna` | Luna | 50 | Epic | Фиолетовая кошка-волшебница в синем колпаке со звёздами, держит маленькую волшебную палочку. *A purple cat wizard wearing a starry blue pointed hat, holding a tiny magic wand* |
| 4 | `bolt` | Bolt | 80 | Epic | Маленький голубой робот с одной антенной-лампочкой, круглые глаза-экранчики, улыбается. *A small friendly blue robot with one glowing antenna, round screen eyes, smiling* |
| 5 | `ember` | Ember | 120 | Mythic | Дружелюбный оранжево-красный дракончик, маленькие крылья, пламя-хохолок на голове. *A friendly baby dragon, orange and red, tiny wings, small flame tuft on its head* |
| 6 | `frost` | Frost | 170 | Legendary | Полярная лисичка с пушистым хвостом и ледяным голубым шарфом, вокруг снежинки. *An arctic fox with a fluffy tail wearing an icy blue scarf, a few snowflakes around* |
| 7 | `coco` | Coco | 230 | Legendary | Обезьянка-астронавт в белом скафандре со стеклянным шлемом, на шлеме звёздочка. *A monkey astronaut in a white space suit with a glass helmet, a star emblem on the helmet* |
| 8 | `rex` | Rex | 300 | Legendary | Зелёный тираннозаврик в кедах и наушниках, рок-жест лапкой. *A green cartoon T-rex wearing sneakers and headphones, making a rock gesture* |
| 9 | `nova` | Nova | 400 | Legendary | Девочка-супергерой в фиолетово-бирюзовом костюме, волосы как хвост кометы со звёздами. *A kid superhero girl in a purple and teal suit, hair flowing like a comet trail with sparkles* |
| 10 | `shadow` | Shadow | 500 | Legendary | Панда-ниндзя в тёмной повязке на лбу, поза «готов к прыжку», чёрно-белая с тёмно-синими акцентами. *A ninja panda with a dark headband, playful action pose, black and white with navy accents* |
| 11 | `zephyr` | Zephyr | 650 | Ultra | Крылатый единорог с радужной гривой и лёгким сиянием, парит. *A winged unicorn with a flowing rainbow mane, gentle glow, floating* |
| 12 | `orion` | Orion | 800 | Ultra | Космический золотой лев, грива — ночное небо с созвездиями, величественный и добрый. *A majestic golden cosmic lion whose mane is a night sky with constellations, kind face* |

## Что НЕ нужно рисовать

- Аватары `leon` и `spike` (тоже Supercell) — заменяю на эмодзи-аватары, картинки не нужны.
- Иконки предметов/UI (`objects/`, `ui/`) — они оригинальные, остаются как есть.

Готовые файлы просто положи в любую папку (например `~/Documents/Claude/Projects/kids-learning/_new-heroes/`) и скажи мне — я сам сконвертирую в 320×320 webp и подключу.
