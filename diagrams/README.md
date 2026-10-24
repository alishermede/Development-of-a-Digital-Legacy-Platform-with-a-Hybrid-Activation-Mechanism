# Diagrams

| File | Diagram | Task |
|---|---|---|
| `src/01-system-context.puml` → `export/01-system-context.png`, `.svg` | System context (C4 level 1) | DIP-16 |
| `src/02-use-cases-owner.puml` → `export/02-use-cases-owner.png`, `.svg` | Use Case diagram: owner | DIP-17 |
| `src/02-use-cases-system.puml` → `export/02-use-cases-system.png`, `.svg` | Use Case diagram: trusted person, recipient and system | DIP-17 |
| `src/03-components.puml` → `export/03-components.png`, `.svg` | Component diagram, draft (C4 levels 2–3) | DIP-18 |
| `src/04-activation-state-machine.puml` → `export/04-activation-state-machine.png`, `.svg` | Activation state machine (UML) | DIP-18 |

Editable sources are written in [PlantUML](https://plantuml.com) with the bundled C4-PlantUML library. Exports have the same file name as the source.

## How to render

- **VS Code:** install the "PlantUML" extension, open a `.puml` file and export it to PNG / SVG.
- **Command line** (Java and Graphviz required):
  ```bash
  java -jar plantuml.jar -tpng -o ../export diagrams/src/01-system-context.puml
  java -jar plantuml.jar -tsvg -o ../export diagrams/src/01-system-context.puml
  ```
- **Online:** paste the source into https://www.plantuml.com/plantuml
