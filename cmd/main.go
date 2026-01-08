package main

import (
	"audit-sendiri/internal/api"
	"audit-sendiri/internal/db"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		err = godotenv.Load("../.env")
	}
	if err != nil {
		log.Println("Warning: .env file not found. Make sure environment variables are set.")
		log.Println("You can set them manually or create a .env file in the project root.")
	}

	database, err := db.NewSawitDB("./data")
	if err != nil {
		log.Fatalf("Failed to initialize DB: %v", err)
	}
	database.Migrate()
	app := fiber.New()
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	if allowedOrigins == "" {
		allowedOrigins = "http://localhost:5173,http://localhost:3000"
		log.Println("WARNING: Using default ALLOWED_ORIGINS for development. Set environment variable for production!")
	}
	
	app.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     "GET,POST,PUT,DELETE",
		AllowHeaders:     "Content-Type,Authorization",
		AllowCredentials: true,
		MaxAge:           86400,
	}))

	handler := api.NewHandler(database)
	handler.Register(app)

	app.Static("/", "./frontend/dist")
	app.Get("*", func(c *fiber.Ctx) error {
		return c.SendFile("./frontend/dist/index.html")
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("AuditSendiri Backend running on :%s", port)
	log.Fatal(app.Listen(":" + port))
}
