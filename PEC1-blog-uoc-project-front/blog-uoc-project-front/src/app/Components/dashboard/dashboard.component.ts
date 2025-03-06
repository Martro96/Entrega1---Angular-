import { Component, OnInit } from '@angular/core';
import { PostDTO } from 'src/app/Models/post.dto';
import { PostService } from 'src/app/Services/post.service';
import { SharedService } from 'src/app/Services/shared.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  post: PostDTO[] = [];
  posts!: PostDTO[];
  totalLikes: number = 0;
  totalDislikes: number = 0;

  constructor(
    private postService: PostService,
    private sharedService: SharedService
  ) {
    //¿Por que aquí dentro del constructor no escribimos nada?
  }

  async ngOnInit(): Promise<void> {

    let errorResponse: any;

    try {

      this.post = await this.postService.getPosts();

      this.totalLikes = this.post.reduce((sum,post) => sum + post.num_likes, 0);
      this.totalDislikes = this.post.reduce((sum, post) => sum + post.num_dislikes, 0);
    } catch (error: any) {
      errorResponse = error.error;
      this.sharedService.errorLog(errorResponse)
    }
  }
}
