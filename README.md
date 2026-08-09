# DisBatch: Discord Message Batch Sending Automation Tool
https://portfolio.ilmnn.net/disbatch
 
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
| `Storage`  | AWS S3                                                                |
| `Keys`     | AWS Secrets Manager                                                   |
| `Hosting`  | AWS ECS Fargate, AWS ECR, Docker                                      |
| `Discord`  | [dolfies/discord.py-self](https://github.com/dolfies/discord.py-self) |

## Hosting
- Hosted on AWS ECS Fargate, with Docker images pushed to and from ECR 
- Static SPA frontend is served directly from ECS. 


<sub>© 2025 illu. All rights reserved. This code is for reference only and may not be used, copied, or distributed without permission.</sub>
 
