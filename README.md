# Robot De Cierres

```
versión 1.1.6 - (Rafa) 17/10/2022 - Se añade excepción de gestión a las averías con etiqueta #InstalaCableOperador# --
versión 1.1.5 - (Rafa) 28/07/2022 - Corrección de fallo en provCode --
versión 1.1.4 - (Rafa) 27/07/2022 - Cambiado provisionigCode en la funcion addComentIssue para mostar el pcode del cliente ya que cambio la data obtenida de la api de radius --
versión 1.1.3 - 28/03/2022 - Eliminado del filtro las reglas para SWENO, MARBLANCA --
versión 1.1.1 - 05/10/2021 - Correcion fallo horario permitido --
versión 1.1.1 - 27/09/2021 - Cambios varios --
versión 1.1.0 - 30/07/2021 - Modificado JQL para quitar las averías de SWENO y MARBLANCA --
versión 1.0.9 - 08/02/2021 - Modificado JQL para quitar las averías de MARBLANCA --
versión 1.0.8 -- Añadido codigo si es averia PEPEPHONE --
versión 1.0.7 -- Refactorización a apis MSA --
versión 1.0.6 -- Añadida asignación a usuario cuando el cpe no este registrado y el estado sea up --
versión 1.0.5 -- Quitada limitacion horaria y añadido control de horario con locuciones --
versión 1.0.4 -- Añadido Sistema de Login en Jira --
versión 1.0.3 -- Añadido control horario para el robot --
versión 1.0.2 -- Añadida Locución en el cierre --
versión 1.0.1 -- Añadido control por fecha de creación y estado en radius --
versión 1.0.0 -- Initial Commit --

```

Plugins
```
Axios -> https://www.npmjs.com/package/axios (peticiones)
Jquery -> https://jquery.com/ (libreria JS)
SweetAlert2 -> https://sweetalert2.github.io/ (Alertas JS)
```

Git
```
git init // inicia el proceso de git
git status // revisa los archivos en el repositorio
git add . // añade los archivos a subir al repositorio 
git commit -m "comentario del commit" // añade commit al subir los archivos
git checkout -- . // revisa los cambios por si modificamos cosas antes de subir al repositorio

git remote add origin https://github.com/zelenzaMMdev/Robot-Cierres.git // le decimos a que repositorio tiene que subir los archivos
git branch -M main // lo usarmos para dirigirnos al repositorio antes de hacer el push
git push -u origin main // subimos los archivos al repositorio.
