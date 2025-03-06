import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderMenus } from 'src/app/Models/header-menus.dto';
import { PostDTO } from 'src/app/Models/post.dto';
import { HeaderMenusService } from 'src/app/Services/header-menus.service';
import { LocalStorageService } from 'src/app/Services/local-storage.service';
import { PostService } from 'src/app/Services/post.service';
import { SharedService } from 'src/app/Services/shared.service';
import { UntypedFormControl } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  // posts!: PostDTO[]; ¿Sería mejor cambiarlo de nuevo a posts! ??
  posts: PostDTO[] = []
  showButtons: boolean;
  filteredPosts: PostDTO[] = []; 
  filterControl = new UntypedFormControl; 
  


  constructor(
    private postService: PostService,
    private localStorageService: LocalStorageService,
    private sharedService: SharedService,
    private router: Router,
    private headerMenusService: HeaderMenusService
  ) {
    this.showButtons = false;
  }

  async ngOnInit(): Promise<void> {
    await this.loadPosts();    

    this.filterControl.valueChanges.subscribe((value) => {
      this.applyFilter(value)
    })

    this.headerMenusService.headerManagement.subscribe(
      (headerInfo: HeaderMenus) => {
        if (headerInfo) {
          this.showButtons = headerInfo.showAuthSection;
        }
      }
    );
  }

  async loadPosts(): Promise<void> { //quito el private por el ejercicio 9
    // TODO 2
    let errorResponse: any;
    const userId = this.localStorageService.get('user_id');
    
    try {
      this.posts = await this.postService.getPosts() //mostramos siempre aunque no estle loggeado
      this.filteredPosts = [...this.posts]  
    } catch (error: any) {
      errorResponse = error.error;
      this.sharedService.errorLog(errorResponse);
    }
    
    this.showButtons = !!userId; //Como el enunciado nos pide enseñar los botones sólo si el usuario está loggeado, lo convertimos en un booleano.
    
  }

  async like(postId: string): Promise<void> {
    let errorResponse: any;
    try {
      await this.postService.likePost(postId);
      this.loadPosts();
    } catch (error: any) {
      errorResponse = error.error;
      this.sharedService.errorLog(errorResponse);
    }
  }

  async dislike(postId: string): Promise<void> {
    let errorResponse: any;
    try {
      await this.postService.dislikePost(postId);
      this.loadPosts();
    } catch (error: any) {
      errorResponse = error.error;
      this.sharedService.errorLog(errorResponse);
    }
  }

    //Ejercicio 10
  
    applyFilter(searchText: string): void { //Creo un término para referirme a lo que busque el usuario en el filtro (searchText)
      if (!searchText) { //Si no hay ninguna palabra aplicada en el filtro, seguimos la lógica de antes con los posts y mostraríamos todos. 
        this.filteredPosts = [...this.posts];
      } else {
        this.filteredPosts = this.posts.filter(post => //Aquí aplicamos el método filter y lo implementaremos en el título, la descripción y la categoría a buscar
          post.title.toLowerCase().includes(searchText.toLowerCase()) || //Aplicamos la lógica de toLoweCase para que de igual si lo buscan en min o en mayus
          post.description.toLowerCase().includes(searchText.toLowerCase()) || //Aplicamos la lógica de toLoweCase para que de igual si lo buscan en min o en mayus
          post.categories.some(category => category.title.toLowerCase().includes(searchText.toLowerCase())) //Como la categoría es un listado, usamos el método some para que seleccione dentro del array. También aplica la lógica de toLowerCase
        );
      }
    }
  
}
