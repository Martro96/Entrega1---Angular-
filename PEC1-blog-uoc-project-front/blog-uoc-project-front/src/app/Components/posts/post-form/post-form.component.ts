import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from 'src/app/Services/category.service';
import { LocalStorageService } from 'src/app/Services/local-storage.service';
import { PostService } from 'src/app/Services/post.service';
import { SharedService } from 'src/app/Services/shared.service';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { PostDTO } from 'src/app/Models/post.dto';
import { CategoryDTO } from 'src/app/Models/category.dto';
import { promises } from 'dns';
@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss'],
})
export class PostFormComponent implements OnInit {
  categories : CategoryDTO[] = []; 
  post: PostDTO;
  title: UntypedFormControl;
  description: UntypedFormControl;
  publication_date: UntypedFormControl;
  selectedCategories: UntypedFormControl; 

  // category: CategoryDTO

  postForm: UntypedFormGroup;
  isValidForm: boolean | null;

  private isUpdateMode: boolean = false;
  private validRequest: boolean = false;
  private postId: string | null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private postService: PostService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private sharedService: SharedService,
    private localStorageService: LocalStorageService,
    private categoryService: CategoryService
  ) {
      // TODO 13
    
      this.isValidForm = null;
      this.postId = this.activatedRoute.snapshot.paramMap.get('id');
      this.post = new PostDTO('', '', 0, 0, new Date()); 
      this.title = new UntypedFormControl(this.post.title, [Validators.required, Validators.maxLength(55)],);
      this.description = new UntypedFormControl(this.post.description, [Validators.required, Validators.maxLength(255)],);
      this.publication_date = new UntypedFormControl(this.post.publication_date, [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]);
      this.selectedCategories = new UntypedFormControl([]);

      this.postForm = this.formBuilder.group({
        title: this.title, 
        description: this.description,
        publication_date: this.publication_date, 
        categories: this.selectedCategories 
      });
  }
  async ngOnInit(): Promise<void> {
    let errorResponse: any;

    if (this.postId) {
      this.isUpdateMode = true;
      try {
        const category = await this.categoryService.getCategoryById(this.postId);
        this.categories = category ? [category] : [];

        this.post = await this.postService.getPostById(this.postId);
        this.title.setValue(this.post.title);
        this.description.setValue(this.post.description);
        this.publication_date.setValue(this.post.publication_date);
        this.selectedCategories.setValue(this.post.categories.map(cat => cat.categoryId));

        this.postForm = this.formBuilder.group({
          title: this.title,
          description: this.description,
          publication_date: this.publication_date,
          categories: this.selectedCategories
        });
      } catch (error: any) {
        errorResponse = error.error;
        this.sharedService.errorLog(errorResponse);
      }
    }
  }


  private async editPost(): Promise<boolean> {
    let errorResponse: any;
    let responseOK: boolean = false;

    if (this.postId) {
      const categoryId = this.localStorageService.get('category_id');
      if (categoryId) {
        this.post.categories = [{ 
          categoryId: '', 
          title: '', 
          description: '', 
          css_color: '',
          userId: ''
        }]

        try {
          await this.postService.updatePost(this.postId, this.post);
          responseOK = true;
        } catch (error: any) {
          errorResponse = error.error;
          this.sharedService.errorLog(errorResponse);
        }

        await this.sharedService.managementToast('postFeedback', responseOK, errorResponse);
        if (responseOK) {
          this.router.navigateByUrl('posts');
        }
      }
    }
    return responseOK;
  }


  private async createPost(): Promise<boolean> {
    let errorResponse: any;
    let responseOK: boolean = false;

    const userId = this.localStorageService.get('user_id');
      if (userId) {
      this.post.userId = userId
    }
      try {
        await this.postService.createPost(this.post);
        responseOK = true;
      } catch (error: any) {
        errorResponse = error.error;
        this.sharedService.errorLog(errorResponse);
      }

      await this.sharedService.managementToast('postFeedback', responseOK, errorResponse);
      if (responseOK) {
        this.router.navigateByUrl('posts')
      }
      return responseOK;
    }
  

  async savePost() {
    this.isValidForm = false;
    if(this.postForm.invalid) {
      return
    }
    this.isValidForm = true;
    this.post = this.postForm.value;

    if (this.isUpdateMode) {
      this.validRequest = await this.editPost();
    } else {
      this.validRequest = await this.createPost();
    }
  }
}

