# Discord Message Automation Tool
- Automate sending hiring posts on commission boards, sharing new social media posts, and more!
- English, Japanese, Chinese (Traditional and Simplified), and Korean localization

### Warning, This is Self-Botting!
**This is against Discord Terms of Service**, BUT it's very hard for discord to detect or enforce (similar to how Vencord is also against TOS but never enforced).
Use only if you are fine with the risks involved~

## Stack
| Section    | Purpose                                                               |
|------------|-----------------------------------------------------------------------| 
| `/server`  | FastAPI, Python                                                       |
| `/web`     | React, Tailwind, JSX                                                  |
| `Database` | MongoDB                                                               |
| `Storage`  | Local filesystem                                                      |
| `Keys`     | Local file or `FERNET_KEY` environment variable                       |
| `Hosting`  | Docker, Docker Compose                                                |
| `Discord`  | [dolfies/discord.py-self](https://github.com/dolfies/discord.py-self) |

## Local Run
1. Install Docker and Docker Compose.
2. Start the stack with `docker compose up --build`.
3. Open `http://localhost:8000` in your browser.

Uploads are stored under `server/static/uploads` and the Fernet key is persisted in `server/data/fernet.key` when you run locally without Docker. If you prefer environment variables, set `MONGO_URI` and `FERNET_KEY` before starting the server.

[![Demo](https://github.com/user-attachments/assets/8a491894-6bf5-447b-9360-4fb38e315e24)](https://youtu.be/F0IlZSnug6Q)  

<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/9334ed3a-f8c1-46d4-8f9a-6805f5cad087" />
<img width="400" alt="image" src="https://github.com/user-attachments/assets/42b51422-1d7b-42f2-8015-574e1afdf790" />
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/1bcc52cd-016e-48f2-a989-bf0323dc3b82" />
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/78829219-57c2-4503-8fee-f9748c8abf30" />
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/8bfa174b-441d-4a5b-8fdf-00ddcb526c5d" />
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/24ded117-9dd9-4821-9c20-8600df31b7e1" />


<sub>© 2025 illu. All rights reserved. This code is for reference only and may not be used, copied, or distributed without permission.</sub>
 
