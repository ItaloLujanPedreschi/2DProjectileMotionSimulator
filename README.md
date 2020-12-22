# 2DProjectileMotionSimulator

![2DProjectileMotionSimulator Banner](src/github-visuals/2d_projectile_motion_simulator.png)
<div align="center">
  <a href="https://italolujan.com/2DProjectileMotionSimulator/">Live Site</a>
</div>

2D Projectile Motion Simulator is a visual simulation of the classical mechanics problem of projectile motion.


# Technologies Stack

* HTML with Canvas - Simple drawings and requestAnimationFrame allowed for smooth regulated framerate leading to predictable projectile speed
* CSS - Easy to implement styling
* Javascript - Allowed for DOM manipulation to allow for more function than a purely HTML/CSS combination


## Functionality & MVP
Users are be able to...
* Start with an instruction modal
* Choose a projectile's initial velocity, launch angle, and gravity.
* Run simulations and receive information about projectile flight including flight time, max height, and horizontal travel distance.
* Open instructions modal from in app

## Wireframes
The app will have a single screen with an information modal. The controls and access to the information modal will be on a bar on top of the projectile visualizer.
![Wireframe](JS_Wireframe.png)

## Architecture and Technologies
The project will use the following technologies:
* Javascript
* HTML Canvas
In addition to the entry file, this project will have the following two scripts:
projectile.js: this script will handle drawing the projectile
physics.js: this script will be in charge of moving the projectile using equations to replicate ideal projectile motion

## Implementation Timeline
Day 1: Assure skeleton is setup properly. Write basic entry file. Choose screen dimensions and place grid overlay. Learn how to normalize movement speed of projectile.
Day 2: Build projectile motion logic. Assure function works with hard coded inputs. Design user input and allow it to manipulate simulation.
Day 3: Create instructions modal. Create spreadsheet of inputs based off simulations. Allow for deletion of inputs.
Day 4: Allow user to choose height of initial projectile launch. Animate changes in height.

## Bonus Features
* Add table with launch data
* Allow ability to changed launch height
