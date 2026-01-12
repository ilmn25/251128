# Discord Message Automation Tool
Automate sending hiring posts on commission boards, sharing new social media posts, and more.

### Warning, This is Self-Botting!
**This is against Discord Terms of Service**, BUT it's very hard for discord to detect or enforce (similar to how Vencord is also against TOS but never enforced).
Use only if you are fine with the risks involved~
## Stack

| Section    | Purpose                                                               |
|------------|-----------------------------------------------------------------------| 
| `/server`  | FastAPI, Python                                                       |
| `/web`     | React, Tailwind, JSX                                                  |
| `Database` | MongoDB                                                               |
| `Storage`  | AWS S3                                                                |
| `Keys`     | AWS Secrets Manager                                                   |
| `Hosting`  | AWS ECS Fargate, AWS ECR, Docker                                      |
| `Discord`  | [dolfies/discord.py-self](https://github.com/dolfies/discord.py-self) |

## Hosting
- Hosted on AWS ECS Fargate, with Docker images pushed to and from ECR 
- Static SPA frontend is served directly from ECS. 

<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/ca281e98-75c2-46c5-8e29-122819a46c88" />
<img width="780" height="717" alt="image" src="https://github.com/user-attachments/assets/42b51422-1d7b-42f2-8015-574e1afdf790" />
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/1bcc52cd-016e-48f2-a989-bf0323dc3b82" />
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/78829219-57c2-4503-8fee-f9748c8abf30" />
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/8bfa174b-441d-4a5b-8fdf-00ddcb526c5d" />
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/24ded117-9dd9-4821-9c20-8600df31b7e1" />


<sub>© 2025 illu. All rights reserved. This code is for reference only and may not be used, copied, or distributed without permission.</sub>
 
