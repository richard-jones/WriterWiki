import git, os, glob, time, json
from models import Page, Template

class DAO(object):
    
    def __init__(self, repo_path):
        self.repo_path = repo_path
        self.pages = os.path.join(self.repo_path, "pages")
        self.resources = os.path.join(self.repo_path, "resources")
        self.templates = os.path.join(self.repo_path, "templates")
        self.works = os.path.join(self.repo_path, "works")
        self.status = os.path.join(self.repo_path, "state.json")
        self.repo = git.Repo(self.repo_path)
    
    # Initialise the storage
    ###################################################################
    
    @classmethod
    def init_repo(self, directory):
        if not os.path.exists(directory):
            os.mkdir(directory)
        repo = git.Repo.init(directory)
        
        pages = os.path.join(directory, "pages")
        resources = os.path.join(directory, "resources")
        templates = os.path.join(directory, "templates")
        works = os.path.join(directory, "works")
        
        os.mkdir(pages)
        os.mkdir(resources)
        os.mkdir(templates)
        os.mkdir(works)
        
        f = open(os.path.join(directory, "tags.json"), "w")
        f.write("{}")
        f.close()
        
        f = open(os.path.join(directory, "state.json"), "w")
        f.write('{ "working_set" : [] }')
        f.close()
        
        f = open(os.path.join(pages, "welcome.txt"), "w")
        f.write("Welcome to WriterWiki")
        f.close()
        
        f = open(os.path.join(resources, "placeholder"), "w")
        f.write("You can remove this resource")
        f.close()
        
        f = open(os.path.join(templates, "blank-template.txt"), "w")
        f.write("")
        f.close()
        
        f = open(os.path.join(works, "work.json"), "w")
        f.write("{}")
        f.close()
        
        repo.git.add(repo.untracked_files)
        repo.git.commit("-m \"initialise writerwiki\"")
    
    # Page management
    ###################################################################
    
    def page_exists(self, name):
        path = os.path.join(self.pages, name + ".txt")
        return os.path.isfile(path)
    
    def get_page(self, name):
        path = os.path.join(self.pages, name + ".txt")
        if not os.path.exists(path):
            return None
        f = open(path, "r")
        return Page(name, f)
        
    def store_page_update(self, page):
        path = os.path.join(self.pages, page.name + ".txt")
        f = open(path, "w")
        f.write(page.content.read())
        f.close()
    
    def get_all_pages(self):
        files = [f[:-4] for f in os.listdir(self.pages)]
        files.sort()
        return files
    
    def get_recently_modified_pages(self, limit=-1):
        files = self._list_recently_modified_files(self.pages, limit)
        start = len(self.pages) + 1
        end = len(".txt")
        return [f[start:-end] for f in files]
    
    # manage the working set
    ###################################################################
    
    def get_workingset(self):
        status = self.get_status()
        f = status.get('working_set', [])
        f.sort()
        return f
    
    def update_workingset(self, newset):
        status = self.get_status()
        status['working_set'] = newset
        self.save_status(status)
        
        
    # manage the tags
    ####################################################################
    
    def get_tags(self, page):
        path = os.path.join(self.repo_path, "tags.json")
        j = self._json_read(path)
        return j.get('pages', {}).get(page, [])
    
    def set_tags(self, page, tags):
        path = os.path.join(self.repo_path, "tags.json")
        j = self._json_read(path)
        
        if not j.has_key("pages"):
            j['pages'] = {}
        if not j.has_key("tags"):
            j['tags'] = {}
        if not j.has_key("cloud"):
            j['cloud'] = []
        
        j['pages'][page] = tags
        
        for tag in tags:
            if page not in j['tags'].get(tag, []):
                if j['tags'].has_key(tag):
                    j['tags'][tag].append(page)
                else:
                    j['tags'][tag] = [page]
            if tag not in j['cloud']:
                j['cloud'].append(tag)
        
        with open(path, "w") as f: f.write(json.dumps(j))
    
    def get_all_tags(self):
        path = os.path.join(self.repo_path, "tags.json")
        j = self._json_read(path)
        return j.get('cloud', [])
    
    def get_tagged_pages(self, tag):
        path = os.path.join(self.repo_path, "tags.json")
        j = self._json_read(path)
        return j.get('tags', {}).get(tag, [])
    
    # Works
    ###################################################################
    
    def get_work_names(self):
        path = os.path.join(self.repo_path, "works")
        files = [f[:-5] for f in os.listdir(path)]
        return files
        
    def get_work(self, work_name):
        path = os.path.join(self.repo_path, "works", work_name + ".json")
        if not os.path.isfile(path):
            return {}
        return self._json_read(path)
        
    def save_work(self, work_name, work):
        path = os.path.join(self.repo_path, "works", work_name + ".json")
        with open(path, "w") as f:
            f.write(json.dumps(work))
    
    # Status
    ###################################################################
    
    def get_status(self):
        return self._json_read(self.status)
    
    def save_status(self, status):
        f = open(self.status, "w")
        f.write(json.dumps(status))
        f.close()
        
    # Version Control
    ###################################################################
    
    def add_all_commit(self):
        msg = "commit latest, adding " + ", ".join(self.repo.untracked_files)
        self.repo.git.add(".")
        try:
            self.repo.git.commit("-m \"" + msg + "\"")
        except git.GitCommandError:
            pass
    
    # Templates - currently not used
    ###################################################################
    
    def get_template_names(self):
        return [fn[:-4] for fn in os.listdir(self.templates) if fn.endswith("txt")]
        
    def get_template(self, name):
        path = os.path.join(self.templates, name + ".txt")
        f = open(path, "r")
        return Template(name, f)
    
    # Utilities
    ###################################################################
        
    def _list_recently_modified_files(self, path, limit=-1):
        date_file_list = []
        for file in glob.glob(os.path.join(path, '*.*')):
            stats = os.stat(file)
            lastmod_date = time.localtime(stats[8])
            date_file_tuple = lastmod_date, file
            date_file_list.append(date_file_tuple)
        date_file_list.sort(reverse=True)
        l = [f for d, f in date_file_list]
        if len(l) > 0 and limit > 0:
            l = l[:limit]
        return l
    
    def _json_read(self, file):
        with open(file) as f:
            s = f.read()
            j = None
            if s is not None and s != "":
                j = json.loads(s)
            else:
                j = {}
        return j
    