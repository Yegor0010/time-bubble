export const create = <T>(url: string, data: T) => {
  return new Promise<void>((resolve, reject) => {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        resolve();
      })
      .catch(error => reject(error));
  });
}

export const read = <T>(url: string) => {
  return new Promise<T>((resolve, reject) => {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => resolve(data))
      .catch(error => reject(error));
  });
}

export const update = <T>(url: string, data: T) => {
  return new Promise<void>((resolve, reject) => {
    fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        resolve();
      })
      .catch(error => reject(error));
  });
}

export const remove = (url: string) => {
  return new Promise<void>((resolve, reject) => {
    fetch(url, {
      method: 'DELETE'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        resolve();
      })
      .catch(error => reject(error));
  });
}