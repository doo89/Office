import pygame
import random

# Initialize la partie
pygame.init()

# Définition de la taille de l'écran
width = 800
height = 600
screen = pygame.display.set_mode((width, height))
pygame.display.set_caption("Flappy Bird")

# Définition des couleurs
white = (255, 255, 255)
black = (0, 0, 0)

# Lires les images
bird_img = pygame.image.load("bird.png")
pipe_img = pygame.image.load("pipe.png")
background_img = pygame.image.load("background.png")

# Définir la classe Bird
class Bird:
    def __init__(self):
        self.x = 100
        self.y = height // 2
        self.velocity = 0
        self.gravity = 0.5

    def jump(self):
        self.velocity = -10

    def update(self):
        self.velocity += self.gravity
        self.y += self.velocity

    def draw(self):
        screen.blit(bird_img, (self.x, self.y))

# Définir la classe Pipe
class Pipe:
    def __init__(self):
        self.x = width
        self.y = random.randint(100, 400)
        self.speed = 5

    def update(self):
        self.x -= self.speed

    def draw(self):
        screen.blit(pipe_img, (self.x, self.y))

# Créer des un oiseau et des tuyaux
bird = Bird()
pipes = [Pipe()]

# Boucle de la partie
running = True
clock = pygame.time.Clock()

while running:
    # Handle events
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE:
                bird.jump()

    # Update bird and pipes
    bird.update()
    for pipe in pipes:
        pipe.update()

    # Check for collision
    for pipe in pipes:
        if bird.x + bird_img.get_width() > pipe.x and bird.x < pipe.x + pipe_img.get_width() and (bird.y < pipe.y or bird.y + bird_img.get_height() > pipe.y + pipe_img.get_height()):
            running = False

    # Remove off-screen pipes
    if pipes[0].x + pipe_img.get_width() < 0:
        pipes.pop(0)

    # Add new pipe
    if pipes[-1].x < width - 200:
        pipes.append(Pipe())

    # Draw background, bird, and pipes
    screen.blit(background_img, (0, 0))
    bird.draw()
    for pipe in pipes:
        pipe.draw()

    # Update the display
    pygame.display.update()
    clock.tick(30)

# Quit the game
pygame.quit()
