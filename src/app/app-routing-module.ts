import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  {
    path: 'cuenta',
    loadChildren: () => import('./auth/auth-module').then((m) => m.AuthModule),
  },
  {
    path: 'inicio',
    loadChildren: () => import('./inicio/inicio-module').then((m) => m.InicioModule),
  },
  {
    path: 'mascotas',
    loadChildren: () => import('./mascotas/mascotas-module').then((m) => m.MascotasModule),
  },
  {
    path: 'citas',
    loadChildren: () => import('./citas/citas-module').then((m) => m.CitasModule),
  },
  {
    path: 'historial',
    loadChildren: () => import('./historial/historial-module').then((m) => m.HistorialModule),
  },
  { path: '**', redirectTo: 'inicio' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
