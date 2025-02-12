## Users

**Descripción de la entidad**: La entidad `Users` almacena la información de los jugadores registrados en el sistema. Cada usuario puede participar en torneos, partidas y mantener relaciones de amistad con otros jugadores.

**Descripción de los atributos**:

- `id` (integer, primary key): Identificador único de cada usuario.
- `user_id` (varchar): Nombre de usuario único.
- `description` (varchar): Descripción o biografía del usuario.
- `experience` (integer): Experiencia acumulada del usuario.

---

## Levels

**Descripción de la entidad**: La entidad `Levels` define los diferentes niveles que un usuario puede alcanzar en función de su experiencia acumulada.

**Descripción de los atributos**:

- `level_number` (integer, primary key): Número de nivel.
- `experience_required` (integer): Experiencia mínima requerida para alcanzar este nivel.

---

## Friends

**Descripción de la relación**: La relación `Friends` representa las amistades entre usuarios. Es una relación **N:M**, ya que un usuario puede tener múltiples amigos y viceversa.

---

## Game

**Descripción de la entidad**: La entidad `Game` representa cada una de las partidas que pueden jugarse en el sistema.

**Descripción de los atributos**:

- `id_game` (integer, primary key): Identificador único de la partida.
- `match_state` (varchar): Estado actual de la partida (ejemplo: activa, finalizada, en espera).

---

## Playing

**Descripción de la relación**: La relación `Playing` es **N:M** y conecta `Users` con `Game`. Representa la participación de los jugadores en cada partida.

**Descripción de los atributos**:

- `user_state` (varchar): Estado del usuario en la partida (vivo, eliminado, espectador, etc.).
- `size` (integer): Tamaño actual del usuario en la partida.
- `n_divisions` (integer): Número de divisiones realizadas por el usuario en la partida.
- `x_position` (integer): Posición X del usuario en el mapa.
- `y_position` (integer): Posición Y del usuario en el mapa.
- `score` (integer): Puntuación obtenida en la partida.

---

## Stats

**Descripción de la relación**: La relación `Stats` es **N:M** y almacena estadísticas de los jugadores en cada partida.

**Descripción de los atributos**:

- `time_played` (integer): Tiempo total que el usuario ha jugado en la partida.
- `num_kills` (integer): Número de eliminaciones realizadas por el usuario.
- `match_date` (date): Fecha en la que se jugó la partida.

---

## Tournament

**Descripción de la entidad**: La entidad `Tournament` representa los torneos organizados en el sistema, en los que los usuarios pueden participar en varias partidas.

**Descripción de los atributos**:

- `id_tournament` (integer, primary key): Identificador único del torneo.
- `tournament_name` (varchar): Nombre del torneo.
- `tournament_description` (varchar): Descripción del torneo.
- `status` (varchar): Estado del torneo (pendiente, activo, finalizado).

---

## Tournament_members

**Descripción de la relación**: La relación `Tournament_members` es **N:M** y conecta `Users` con `Tournament`, representando a los jugadores inscritos en un torneo.

**Descripción de los atributos**:

- `tournament_score` (integer): Puntuación acumulada del usuario en el torneo, utilizada para calcular rankings.
    - Se actualizará automáticamente tras cada partida sumando la puntuación obtenida en `Playing`.
    - Permite obtener rankings de torneos sin necesidad de cálculos en tiempo real.

---

## Tournament_games

**Descripción de la relación**: La relación `Tournament_games` es **N:M** y conecta `Tournament` con `Game`, indicando qué partidas forman parte de un torneo.