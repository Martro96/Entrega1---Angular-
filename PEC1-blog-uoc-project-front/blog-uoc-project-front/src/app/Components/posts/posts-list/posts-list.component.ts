import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/Services/local-storage.service';
import { PostService } from 'src/app/Services/post.service';
import { SharedService } from 'src/app/Services/shared.service';
import { CategoryDTO } from 'src/app/Models/category.dto';
import { CategoryService } from 'src/app/Services/category.service';
import { PostDTO } from 'src/app/Models/post.dto';

@Component({
  selector: 'app-posts-list',
  templateUrl: './posts-list.component.html',
  styleUrls: ['./posts-list.component.scss'],
})
export class PostsListComponent {
  posts!: PostDTO[];

  constructor(
    private postService: PostService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private sharedService: SharedService
  ) {
    this.loadPosts();
  }
  // TODO 12
  private async loadPosts(): Promise<void> {
    let errorResponse: any;
    const userId = this.localStorageService.get('user_id');
  
    console.log("User ID obtenido del LocalStorage:", userId); // hago este console para intentar ver qué usuario está leyendo
  
    if (userId) {
      try {
        const post = await this.postService.getPostsByUserId(userId);
        console.log("Posts obtenidos del servicio:", post); 
        
        this.posts = post //? [post] : [];
    } catch (error: any) {
        errorResponse = error.error;
        console.error("Error al cargar posts:", errorResponse);
        this.sharedService.errorLog(errorResponse);
      }
    } else {
      console.error("No se encontró `user_id` en LocalStorage");
    }
  }

  createPost(): void {
    this.router.navigateByUrl('/user/post');
  }

  updatePost(postId: string): void {
    this.router.navigateByUrl('/user/post/' + postId)
  }

  async deletePost(postId:string): Promise <void> {
    let errorResponse: any; 

    let result= confirm('Confirm delete post with id: ' + postId + '.');
    if (result) {
      try {
        const rowsAffected = await this.postService.deletePost(postId);
        if (rowsAffected.affected > 0) {
          this.loadPosts();
        }
      } catch (error: any) {
        errorResponse. error.error;
        this.sharedService.errorLog(errorResponse)
      }
    }
  }
}
