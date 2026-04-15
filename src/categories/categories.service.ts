import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {CreateCategoryDto} from "./dto/create-category.dto";
import {InjectRepository} from "@nestjs/typeorm";
import {Category} from "../common/entities/category.entity";
import {ILike, Repository} from "typeorm";
import {QueryCategoryDto} from "./dto/query-category.dto";
import {UpdateCategoryDto} from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepo: Repository<Category>,
    ) {
    }

    async  create(createCategoryDto : CreateCategoryDto) {
        const existingCategory = await this.categoryRepo.findOne({
            where : {name : createCategoryDto.name}
        })
        if (existingCategory)
            throw new BadRequestException('Category already exists');

        const category = this.categoryRepo.create(createCategoryDto);
        return this.categoryRepo.save(category);
    }


    async  findAll(query : QueryCategoryDto) {
        const {search} = query;

        const where : any = {} ;
        if(search)
            where.name = ILike(`%${search}%`);

        return this.categoryRepo.find({
            where,
            order : {created_at : 'DESC'}
        })
    }

    async findOne(id: number) {
        const category = await this.categoryRepo.findOne({
            where: { id },
        });

        if (!category)
            throw new NotFoundException('Category not found');
        return category;
    }


    async update(id: number, dto: UpdateCategoryDto) {
        const category = await this.findOne(id);

        if (!Object.keys(dto).length)
            throw new BadRequestException('No data provided to update');


        if (dto.name && dto.name !== category.name) {
            const exists = await this.categoryRepo.findOne({
                where: { name: dto.name },
            });

            if (exists) {
                throw new BadRequestException('Category name already exists');
            }
        }
        Object.assign(category, dto);

        return this.categoryRepo.save(category);
    }

    async  remove (id : number){
        const category = await this.findOne(id);
        await  this.categoryRepo.remove(category);

        return {message : 'Category removed successfully'};
    }

}
