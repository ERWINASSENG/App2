import { Injectable } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  canActivate: CanActivateFn = async (_route, _state) => {
    try {
      const { data } = await this.supabaseService.supabase.auth.getSession();

      if (data?.session) {
        return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      }
    } catch (error) {
      this.router.navigate(['/login']);
      return false;
    }
  };
}
