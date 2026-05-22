import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICategory } from "@/types";
import { startTransition, useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "../ui/input";
import { createCategory, getAllCategories } from "@/lib/actions/category.actions";

type DropdownProps = {
  value?: string;
  onChangeHandler?: (value: string) => void;
};

const Dropdown = ({ value, onChangeHandler }: DropdownProps) => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = () => {
    createCategory({ categoryName: newCategory.trim() })
      .then((category) => {
        setCategories((prevState) => [...prevState, category]);
        setNewCategory('');
      });
  };

  useEffect(() => {
    const getCategories = async () => {
      const categoryList = await getAllCategories();
      categoryList && setCategories(categoryList as ICategory[]);
    };

    getCategories();
  }, []);

  return (
    <Select onValueChange={onChangeHandler} defaultValue={value}>
      <SelectTrigger className="select-field">
        <SelectValue placeholder="Select event category" />
      </SelectTrigger>
      <SelectContent className="bg-white border border-slate-200/80 shadow-lg rounded-xl max-h-[300px]">
        {categories.length > 0 && categories.map((category) => (
          <SelectItem key={category.id} value={category.id} className="select-item p-regular-14 hover:bg-slate-50 focus:bg-slate-50 transition-colors py-2 px-3">
            {category.name}
          </SelectItem>
        ))}
        <AlertDialog>
          <AlertDialogTrigger className="p-medium-14 flex w-full items-center gap-2 rounded-lg py-2.5 pl-8 text-indigo-600 font-semibold hover:bg-indigo-50/50 focus:text-indigo-700 transition-all">
            <span>+</span> Add new category
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white border border-slate-200/80 shadow-xl rounded-2xl max-w-[400px] p-6">
            <AlertDialogHeader className="space-y-2">
              <AlertDialogTitle className="text-lg font-bold text-slate-900">New Category</AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-slate-500 font-medium">
                Create a new category to group and filter your events.
                <Input
                  type="text"
                  placeholder="Category name (e.g. Workshop, Meetup)"
                  className="input-field mt-3 w-full"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 flex gap-3">
              <AlertDialogCancel className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium h-10 px-4 transition-all">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => startTransition(handleAddCategory)}
                disabled={!newCategory.trim()}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium h-10 px-5 shadow-sm active:scale-[0.98] transition-all"
              >
                Add
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SelectContent>
    </Select>
  );
};

export default Dropdown;
