import StringIO
from dao import DAO
from models import Page

class WriterWiki(object):
    
    def __init__(self, repo_path):
        self.dao = DAO(repo_path)
    
    def get_page(self, name):
        page = self.dao.get_page(name)
        if page is None:
            page = Page(name, StringIO.StringIO(""))
        return page
        
    def update_page(self, page):
        self.dao.store_page_update(page)
        
    def snapshot(self):
        self.dao.add_all_commit()
        
    def get_template_names(self):
        return self.dao.get_template_names()
        
    def get_template(self, name):
        return self.dao.get_template(name)
        
    def get_recently_modified_pages(self):
        return self.dao.get_recently_modified_pages()
        
    def get_all_pages(self):
        return self.dao.get_all_pages()
    
    # manage the working set
    ###################################################################
    
    def get_workingset(self):
        return self.dao.get_workingset()
        
    def add_to_workingset(self, page):
        if not self.dao.page_exists(page):
            return
        ws = self.dao.get_workingset()
        if page not in ws:
            ws.append(page)
        self.dao.update_workingset(ws)
        
    def remove_from_workingset(self, page):
        ws = self.dao.get_workingset()
        if page in ws:
            ws.remove(page)
        self.dao.update_workingset(ws)
        
    # manage the tags
    ###################################################################
    
    def get_tags(self, page):
        if not self.dao.page_exists(page):
            return {}
        tags = self.dao.get_tags(page)
        if tags is None:
            return {}
        return tags
        
    def set_tags(self, page, tags):
        if not self.dao.page_exists(page):
            return
        self.dao.set_tags(page, tags)
        
    def get_tag_cloud(self):
        return self.dao.get_all_tags()
        
    def get_tagged_pages(self, tag):
        return self.dao.get_tagged_pages(tag)
        
    # manage the works
    ###################################################################
    
    def get_work_names(self):
        return self.dao.get_work_names()
        
    def get_work_pages(self, work_name):
        work = self.dao.get_work(work_name)
        return work.get("pages", [])